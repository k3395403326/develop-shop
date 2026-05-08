import { Product } from '../types';
import { isRenderableProduct, normalizeProduct } from '../utils/dataGenerator';

const API_TIMEOUT_MS = 8000;

const isProductRecord = (value: unknown): value is Product =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'id' in value &&
      'name' in value &&
      'category' in value &&
      'price' in value &&
      'images' in value,
  );

const normalizeProductList = (products: unknown): Product[] => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter(isProductRecord).map(normalizeProduct).filter(isRenderableProduct);
};

export type ProductFeedRequest = {
  excludeIds: string[];
  limit: number;
  category?: string;
  seed: number;
  signal?: AbortSignal;
};

export const fetchProductFeed = async ({
  excludeIds,
  limit,
  category,
  seed,
  signal,
}: ProductFeedRequest): Promise<Product[]> => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('seed', String(seed));

  if (category) {
    params.set('category', category);
  }

  const trimmed = excludeIds.filter(Boolean);

  if (trimmed.length > 0) {
    params.set('exclude', trimmed.slice(0, 240).join(','));
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(`/api/product-feed?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`product-feed failed: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    return normalizeProductList(data);
  } finally {
    window.clearTimeout(timer);
  }
};
