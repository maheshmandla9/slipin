import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Runs the /api/*.ts edge functions directly inside `vite dev`, so local
 * development is just `npm run dev` — no Vercel CLI, no second process.
 * The functions are plain (req: Request) => Promise<Response> handlers (the
 * Web Fetch API, which the Edge runtime and Node both support natively), so
 * this just bridges Vite's Node-style middleware to that signature.
 *
 * Production deploys (Vercel/Netlify) run these same files as real edge
 * functions — this plugin only exists for local dev, never ships.
 */
export function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const route = req.url.split('?')[0].replace(/^\/api\//, '');
        const modFile = path.resolve(process.cwd(), 'api', `${route}.ts`);
        if (!fs.existsSync(modFile)) return next();

        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          const handler = mod.default as (request: Request) => Promise<Response>;

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: hasBody && chunks.length ? Buffer.concat(chunks) : undefined,
          });

          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error(`[local-api] /api/${route} failed:`, err);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'local_api_error', message: String(err) }));
        }
      });
    },
  };
}
