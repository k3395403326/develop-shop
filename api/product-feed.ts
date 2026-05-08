import { buildProductFeedPayload } from './productFeedLogic';
import { fetchJdTrendingProducts } from './trending-products';

type VercelRequestLike = {
  method?: string;
  url?: string;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
};

const parseSearchParams = (rawUrl: string | undefined): URLSearchParams => {
  if (!rawUrl) {
    return new URLSearchParams();
  }

  const queryIndex = rawUrl.indexOf('?');
  const query = queryIndex >= 0 ? rawUrl.slice(queryIndex + 1) : '';
  return new URLSearchParams(query);
};

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method && req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const params = parseSearchParams(req.url);
    const exclude = params.get('exclude')?.split(',').filter(Boolean) ?? [];
    const limit = Math.min(40, Math.max(1, Number(params.get('limit')) || 15));
    const seed = Number(params.get('seed')) || Date.now();
    const category = params.get('category')?.trim() || undefined;

    const catalog = await fetchJdTrendingProducts();
    const payload = buildProductFeedPayload(catalog, { excludeIds: exclude, limit, seed, category });

    res.status(200).json(payload);
  } catch (error) {
    console.error('product-feed failed', error);
    res.status(200).json([]);
  }
}
