import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { LRUCache } from 'lru-cache';
import os from 'os';
import PQueue from 'p-queue';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import type { CompileResponse, CVData, DocumentMode } from '../shared/schema';
import { buildHarvardLatex } from './latexBuilder';

interface CachedCompileResult {
  pdfBase64: string;
  pageCount: number;
  warnings: string[];
  engine: string;
}

const compileCache = new LRUCache<string, CachedCompileResult>({
  max: 100,
  ttl: 1000 * 60 * 60, // 60 minutes
});

// Concurrency 1 prevents multiple Tectonic processes from contending on the XDG_CACHE_HOME bundle/format cache
const compileQueue = new PQueue({ concurrency: 1 });

// Deduplicate identical in-flight compilations
const inFlightCompiles = new Map<string, Promise<CachedCompileResult>>();

export interface DetectedEngine {
  name: 'tectonic' | 'pdflatex' | 'xelatex' | 'none';
  binPath: string;
  version: string;
}

let cachedEngineInfo: DetectedEngine | null = null;
let bootstrapPromise: Promise<string | null> | null = null;
let warmupPromise: Promise<void> | null = null;

const TECTONIC_MUSL_URL =
  'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz';

function resolveCandidateBins(): Array<{ name: 'tectonic' | 'pdflatex' | 'xelatex'; bin: string }> {
  const localTectonic = path.resolve(process.cwd(), 'bin', 'tectonic');
  const tmpTectonic = path.join(os.tmpdir(), 'tectonic');
  const candidates: Array<{ name: 'tectonic' | 'pdflatex' | 'xelatex'; bin: string }> = [];

  for (const candidatePath of [localTectonic, tmpTectonic]) {
    if (fs.existsSync(candidatePath)) {
      try {
        fs.chmodSync(candidatePath, 0o755);
      } catch {
        // Ignore on read-only fs if already executable
      }
      candidates.push({ name: 'tectonic', bin: candidatePath });
    }
  }

  candidates.push(
    { name: 'tectonic', bin: '/usr/local/bin/tectonic' },
    { name: 'tectonic', bin: 'tectonic' },
    { name: 'pdflatex', bin: 'pdflatex' },
    { name: 'xelatex', bin: 'xelatex' }
  );
  return candidates;
}

function checkBinaryVersion(bin: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve(null);
    }, 4000);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim().split('\n')[0] ?? stdout.trim());
      } else {
        resolve(null);
      }
    });
  });
}

async function bootstrapTectonicBinary(): Promise<string | null> {
  if (process.platform !== 'linux') return null;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const localBinDir = path.resolve(process.cwd(), 'bin');
    let targetDir = localBinDir;
    try {
      await fsPromises.mkdir(localBinDir, { recursive: true });
      fs.accessSync(localBinDir, fs.constants.W_OK);
    } catch {
      targetDir = os.tmpdir();
    }

    const targetBin = path.join(targetDir, 'tectonic');
    if (fs.existsSync(targetBin)) {
      try {
        fs.chmodSync(targetBin, 0o755);
      } catch {
        // ignore
      }
      return targetBin;
    }

    return new Promise<string | null>((resolve) => {
      const cmd = `curl -fsSL "${TECTONIC_MUSL_URL}" | tar -xz -C "${targetDir}" tectonic && chmod +x "${targetBin}"`;
      const child = spawn('sh', ['-c', cmd], { stdio: 'ignore' });
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        resolve(null);
      }, 25000);

      child.on('error', () => {
        clearTimeout(timer);
        resolve(null);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0 && fs.existsSync(targetBin)) {
          resolve(targetBin);
        } else {
          resolve(null);
        }
      });
    });
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}

export async function detectLatexEngine(): Promise<DetectedEngine> {
  if (cachedEngineInfo && cachedEngineInfo.name !== 'none' && fs.existsSync(cachedEngineInfo.binPath)) {
    return cachedEngineInfo;
  }

  for (const candidate of resolveCandidateBins()) {
    const version = await checkBinaryVersion(candidate.bin, ['--version']);
    if (version) {
      cachedEngineInfo = {
        name: candidate.name,
        binPath: candidate.bin,
        version,
      };
      return cachedEngineInfo;
    }
  }

  const downloadedBin = await bootstrapTectonicBinary();
  if (downloadedBin) {
    const version = await checkBinaryVersion(downloadedBin, ['--version']);
    if (version) {
      cachedEngineInfo = {
        name: 'tectonic',
        binPath: downloadedBin,
        version,
      };
      return cachedEngineInfo;
    }
  }

  return {
    name: 'none',
    binPath: '',
    version: 'No LaTeX engine found',
  };
}

export function parseLatexLog(rawLog: string): { errors: string[]; warnings: string[] } {
  const lines = rawLog.split(/\r?\n/);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (line.startsWith('! ') || line.includes('error:')) {
      const nextLine = lines[i + 1] ?? '';
      const lineMatch = /l\.(\d+)/.exec(nextLine) || /:(\d+):/.exec(line);
      const lineNumInfo = lineMatch ? ` (Baris ${lineMatch[1]})` : '';
      const cleanedMsg = line.replace(/^!\s*/, '').replace(/^error:\s*/i, '').trim();
      if (cleanedMsg) {
        errors.push(`${cleanedMsg}${lineNumInfo}`);
      }
    } else if (
      /Overfull \\hbox/i.test(line) ||
      /LaTeX Warning:/i.test(line)
    ) {
      const cleanWarn = line.replace(/^warning:\s*/i, '').trim();
      if (cleanWarn && warnings.length < 5) {
        warnings.push(cleanWarn);
      }
    }
  }

  return { errors, warnings };
}

function resolveWritableCacheEnv(): { home: string; xdgCache: string } {
  const workspaceCacheDir = path.resolve(process.cwd(), '.cache');
  if (!process.env.VERCEL) {
    try {
      fs.mkdirSync(workspaceCacheDir, { recursive: true });
      fs.accessSync(workspaceCacheDir, fs.constants.W_OK);
      const defaultHome = process.env.HOME || '/root';
      // If /root/.cache/Tectonic already has cached files, prefer /root/.cache unless workspaceCacheDir already has Tectonic
      const rootTectonicFormats = path.join(defaultHome, '.cache', 'Tectonic', 'formats');
      const workspaceTectonicFormats = path.join(workspaceCacheDir, 'Tectonic', 'formats');
      if (fs.existsSync(workspaceTectonicFormats)) {
        return { home: defaultHome, xdgCache: workspaceCacheDir };
      }
      if (fs.existsSync(rootTectonicFormats)) {
        return { home: defaultHome, xdgCache: path.join(defaultHome, '.cache') };
      }
      return { home: defaultHome, xdgCache: workspaceCacheDir };
    } catch {
      // Fall through to os.tmpdir()
    }
  }

  const tmpCache = path.join(os.tmpdir(), 'tectonic-cache');
  try {
    fs.mkdirSync(tmpCache, { recursive: true });
  } catch {
    // ignore
  }
  return {
    home: os.tmpdir(),
    xdgCache: tmpCache,
  };
}

async function runProcessInTempDir(
  binPath: string,
  args: string[],
  cwd: string,
  timeoutMs = 60000
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const { home, xdgCache } = resolveWritableCacheEnv();
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HOME: home,
      XDG_CACHE_HOME: xdgCache,
    };

    const child = spawn(binPath, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Kompilasi LaTeX melewati batas waktu 60 detik (Timeout).'));
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

export async function warmupLatexEngine(): Promise<void> {
  if (warmupPromise) return warmupPromise;

  warmupPromise = (async () => {
    const engine = await detectLatexEngine();
    if (engine.name !== 'tectonic') return;

    await compileQueue.add(async () => {
      const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'buatcvkuy-warmup-'));
      const texFilePath = path.join(tempDir, 'warmup.tex');
      const warmupTex = [
        '\\documentclass[10pt,a4paper]{article}',
        '\\usepackage[margin=0.6in]{geometry}',
        '\\usepackage[T1]{fontenc}',
        '\\usepackage[utf8]{inputenc}',
        '\\usepackage{tgtermes}',
        '\\usepackage{libertinus}',
        '\\usepackage{ebgaramond}',
        '\\usepackage{microtype}',
        '\\usepackage{enumitem}',
        '\\usepackage{titlesec}',
        '\\usepackage[hidelinks]{hyperref}',
        '\\begin{document}',
        'Harvard OCS LaTeX Warmup',
        '\\end{document}',
      ].join('\n');

      try {
        await fsPromises.writeFile(texFilePath, warmupTex, 'utf8');
        await runProcessInTempDir(
          engine.binPath,
          ['--untrusted', '--outdir', tempDir, texFilePath],
          tempDir,
          90000
        );
      } catch {
        // Ignore warmup errors; real compile will report any issue
      } finally {
        await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
      }
    });
  })().finally(() => {
    warmupPromise = null;
  });

  return warmupPromise;
}

export async function compileCVToPdf(
  cv: CVData,
  mode: DocumentMode = 'cv'
): Promise<CompileResponse> {
  const startTime = Date.now();
  const texSource = buildHarvardLatex(cv, mode);

  const contentHash = crypto.createHash('sha256').update(texSource).digest('hex');
  const cached = compileCache.get(contentHash);
  if (cached) {
    return {
      ...cached,
      durationMs: Date.now() - startTime,
      cached: true,
    };
  }

  const existingInFlight = inFlightCompiles.get(contentHash);
  if (existingInFlight) {
    const sharedResult = await existingInFlight;
    return {
      ...sharedResult,
      durationMs: Date.now() - startTime,
      cached: true,
    };
  }

  const engine = await detectLatexEngine();
  if (engine.name === 'none') {
    throw new Error(
      'Engine LaTeX (Tectonic / pdflatex / xelatex) tidak ditemukan di server. Pastikan Tectonic terpasang.'
    );
  }

  const taskPromise = compileQueue.add(async (): Promise<CachedCompileResult> => {
    // Re-check cache in case an earlier queued task populated it
    const cachedInsideQueue = compileCache.get(contentHash);
    if (cachedInsideQueue) {
      return cachedInsideQueue;
    }

    const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'buatcvkuy-'));
    const texFilePath = path.join(tempDir, 'resume.tex');
    const pdfFilePath = path.join(tempDir, 'resume.pdf');

    try {
      await fsPromises.writeFile(texFilePath, texSource, 'utf8');

      let args: string[];
      if (engine.name === 'tectonic') {
        args = ['--untrusted', '--outdir', tempDir, texFilePath];
      } else {
        args = [
          '-no-shell-escape',
          '-interaction=nonstopmode',
          '-halt-on-error',
          `-output-directory=${tempDir}`,
          texFilePath,
        ];
      }

      const proc = await runProcessInTempDir(engine.binPath, args, tempDir, 60000);
      const combinedLog = `${proc.stdout}\n${proc.stderr}`;
      const { errors, warnings } = parseLatexLog(combinedLog);

      if (proc.code !== 0 || !fs.existsSync(pdfFilePath)) {
        const readableErr =
          errors.length > 0
            ? errors.join(' | ')
            : combinedLog.slice(-500) || 'Gagal mengompilasi dokumen LaTeX.';
        throw new Error(`Kompilasi LaTeX gagal: ${readableErr}`);
      }

      const pdfBuffer = await fsPromises.readFile(pdfFilePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      const pdfBase64 = pdfBuffer.toString('base64');

      const compiledResult: CachedCompileResult = {
        pdfBase64,
        pageCount,
        warnings,
        engine: `${engine.name} (${engine.version})`,
      };
      compileCache.set(contentHash, compiledResult);
      return compiledResult;
    } finally {
      await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });

  const wrappedPromise = taskPromise.then((res) => {
    if (!res) {
      throw new Error('Antrean kompilasi LaTeX gagal dijalankan.');
    }
    return res;
  });

  inFlightCompiles.set(contentHash, wrappedPromise);

  try {
    const result = await wrappedPromise;
    return {
      ...result,
      durationMs: Date.now() - startTime,
      cached: false,
    };
  } finally {
    inFlightCompiles.delete(contentHash);
  }
}
