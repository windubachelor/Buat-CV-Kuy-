import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import pino from 'pino';
import { compileCVToPdf, detectLatexEngine, warmupLatexEngine } from './src/server/compiler';
import { buildHarvardLatex } from './src/server/latexBuilder';
import { containsForbiddenLatexCommands } from './src/server/latexEscape';
import { CompileRequestSchema } from './src/shared/schema';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export async function createApp() {
  const app = express();

  // Trust Cloud Run / reverse proxy headers so req.ip and rate limiting work accurately
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Required for AI Studio iframe preview
    })
  );

  app.use(cors());
  app.use(express.json({ limit: '512kb' }));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: {
      error: 'Terlalu banyak permintaan kompilasi. Silakan tunggu beberapa detik.',
    },
  });

  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const engine = await detectLatexEngine();
      res.json({
        status: engine.name !== 'none' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        latexEngine: engine.name,
        version: engine.version,
      });
    } catch (err) {
      logger.error({ err }, 'Health check failed');
      res.status(500).json({ status: 'error', message: 'Internal health check error' });
    }
  });

  app.post('/api/compile', apiLimiter, async (req: Request, res: Response) => {
    try {
      const rawJson = JSON.stringify(req.body ?? {});
      if (containsForbiddenLatexCommands(rawJson)) {
        logger.warn('Rejected payload containing forbidden LaTeX macros');
        res.status(400).json({
          error:
            'Input ditolak demi keamanan: terdeteksi makro sistem LaTeX terlarang (mis. \\write18, \\input, \\include).',
        });
        return;
      }

      const parsed = CompileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Data CV tidak valid.',
          details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        });
        return;
      }

      const docMode = parsed.data.mode ?? 'cv';
      const result = await compileCVToPdf(parsed.data.cv, docMode);
      logger.info(
        {
          cvId: parsed.data.cv.id,
          mode: docMode,
          durationMs: result.durationMs,
          pageCount: result.pageCount,
          cached: result.cached,
        },
        'Compiled Harvard LaTeX Document'
      );

      if (req.query.format === 'binary') {
        const pdfBuffer = Buffer.from(result.pdfBase64, 'base64');
        const safeFilename = (parsed.data.cv.personalInfo.fullName || 'Resume')
          .replace(/[^a-zA-Z0-9_-]+/g, '_')
          .slice(0, 60);
        const suffix =
          docMode === 'cover-letter'
            ? 'Harvard_Cover_Letter'
            : docMode === 'combined'
              ? 'Harvard_Application_Package'
              : 'Harvard_CV';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}_${suffix}.pdf"`);
        res.setHeader('X-Page-Count', String(result.pageCount));
        res.send(pdfBuffer);
        return;
      }

      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat kompilasi PDF.';
      logger.error({ err: message }, 'LaTeX compile error');
      res.status(422).json({ error: message });
    }
  });

  app.post('/api/compile/tex', apiLimiter, (req: Request, res: Response) => {
    try {
      const rawJson = JSON.stringify(req.body ?? {});
      if (containsForbiddenLatexCommands(rawJson)) {
        res.status(400).json({
          error:
            'Input ditolak demi keamanan: terdeteksi makro sistem LaTeX terlarang (mis. \\write18, \\input, \\include).',
        });
        return;
      }

      const parsed = CompileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Data CV tidak valid.',
          details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        });
        return;
      }

      const docMode = parsed.data.mode ?? 'cv';
      const texSource = buildHarvardLatex(parsed.data.cv, docMode);
      const suffix =
        docMode === 'cover-letter'
          ? 'Harvard_Cover_Letter'
          : docMode === 'combined'
            ? 'Harvard_Application_Package'
            : 'Harvard_CV';
      res.json({
        tex: texSource,
        filename: `${(parsed.data.cv.personalInfo.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]+/g, '_')}_${suffix}.tex`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat kode sumber .tex';
      res.status(500).json({ error: message });
    }
  });

  // Error handler for oversized JSON payloads
  app.use((err: Error & { type?: string }, _req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.too.large') {
      res.status(413).json({ error: 'Ukuran data CV melebihi batas maksimum (512KB).' });
      return;
    }
    next(err);
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(process.cwd(), 'dist');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT }, 'Buat CV Kuy server listening on port 3000');
    detectLatexEngine()
      .then((engine) => {
        logger.info({ engine: engine.name, version: engine.version }, 'LaTeX engine ready');
        return warmupLatexEngine();
      })
      .then(() => {
        logger.info('LaTeX bundle & format cache warmed up');
      })
      .catch((err) => {
        logger.warn({ err }, 'LaTeX engine check warning');
      });
  });
}

// Only start HTTP listener when executed directly (not when imported by Vitest)
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isMain) {
  startServer().catch((err) => {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  });
}
