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
  max: 50,
  ttl: 1000 * 60 * 30, // 30 minutes
});

const compileQueue = new PQueue({ concurrency: 3 });

export interface DetectedEngine {
  name: 'tectonic' | 'pdflatex' | 'xelatex' | 'none';
  binPath: string;
  version: string;
}

let cachedEngineInfo: DetectedEngine | null = null;

function resolveCandidateBins(): Array<{ name: 'tectonic' | 'pdflatex' | 'xelatex'; bin: string }> {
  const localTectonic = path.resolve(process.cwd(), 'bin', 'tectonic');
  const candidates: Array<{ name: 'tectonic' | 'pdflatex' | 'xelatex'; bin: string }> = [];
  if (fs.existsSync(localTectonic)) {
    try {
      fs.chmodSync(localTectonic, 0o755);
    } catch {
      // Ignore on read-only fs if already executable
    }
    candidates.push({ name: 'tectonic', bin: localTectonic });
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

export async function detectLatexEngine(): Promise<DetectedEngine> {
  if (cachedEngineInfo && cachedEngineInfo.name !== 'none') {
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

function resolveWritableHome(): { home: string; xdgCache?: string } {
  const defaultHome = process.env.HOME || '/root';
  if (process.env.VERCEL) {
    return {
      home: os.tmpdir(),
      xdgCache: path.join(os.tmpdir(), 'tectonic-cache'),
    };
  }
  try {
    fs.accessSync(defaultHome, fs.constants.W_OK);
    return { home: defaultHome };
  } catch {
    return {
      home: os.tmpdir(),
      xdgCache: path.join(os.tmpdir(), 'tectonic-cache'),
    };
  }
}

async function runProcessInTempDir(
  binPath: string,
  args: string[],
  cwd: string,
  timeoutMs = 20000
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const { home, xdgCache } = resolveWritableHome();
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HOME: home,
    };
    if (xdgCache) {
      env.XDG_CACHE_HOME = xdgCache;
    }

    const child = spawn(binPath, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Kompilasi LaTeX melewati batas waktu 20 detik (Timeout).'));
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

  const engine = await detectLatexEngine();
  if (engine.name === 'none') {
    throw new Error(
      'Engine LaTeX (Tectonic / pdflatex / xelatex) tidak ditemukan di server. Pastikan Tectonic terpasang.'
    );
  }

  const result = await compileQueue.add(async (): Promise<CachedCompileResult> => {
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

      const proc = await runProcessInTempDir(engine.binPath, args, tempDir, 20000);
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

      return {
        pdfBase64,
        pageCount,
        warnings,
        engine: `${engine.name} (${engine.version})`,
      };
    } finally {
      await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });

  if (!result) {
    throw new Error('Antrean kompilasi LaTeX gagal dijalankan.');
  }

  compileCache.set(contentHash, result);

  return {
    ...result,
    durationMs: Date.now() - startTime,
    cached: false,
  };
}
