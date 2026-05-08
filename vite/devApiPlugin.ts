import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { fetchJdTrendingProducts } from '../api/trending-products';
import { buildProductFeedPayload } from '../api/productFeedLogic';

const sendJson = (res: ServerResponse, statusCode: number, body: unknown): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

export const devApiPlugin = (): Plugin => ({
  name: 'dev-shop-api',
  configureServer(server) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const rawUrl = req.url;

      if (!rawUrl?.startsWith('/api/')) {
        next();
        return;
      }

      if (req.method && req.method !== 'GET') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      try {
        const url = new URL(rawUrl, 'http://127.0.0.1');

        if (url.pathname === '/api/trending-products') {
          const products = await fetchJdTrendingProducts();
          sendJson(res, 200, products);
          return;
        }

        if (url.pathname === '/api/product-feed') {
          const catalog = await fetchJdTrendingProducts();
          const exclude = url.searchParams.get('exclude')?.split(',').filter(Boolean) ?? [];
          const limit = Math.min(40, Math.max(1, Number(url.searchParams.get('limit')) || 15));
          const seed = Number(url.searchParams.get('seed')) || Date.now();
          const category = url.searchParams.get('category')?.trim() || undefined;
          const payload = buildProductFeedPayload(catalog, { excludeIds: exclude, limit, seed, category });
          sendJson(res, 200, payload);
          return;
        }
      } catch (error) {
        console.error('[dev-shop-api]', error);
        sendJson(res, 500, { message: 'Dev API error' });
        return;
      }

      next();
    });
  },
});
