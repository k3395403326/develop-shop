import type { ApiProduct } from './trending-products';

export type ProductFeedParams = {
  excludeIds: string[];
  limit: number;
  seed: number;
  category?: string;
};

const mulberry32 = (seed: number) => {
  let state = seed % 2147483646 || 1;

  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const arr = [...items];
  const rand = mulberry32(seed);

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j]!;
    arr[j] = tmp!;
  }

  return arr;
};

export const buildProductFeedPayload = (all: ApiProduct[], params: ProductFeedParams): ApiProduct[] => {
  const exclude = new Set(params.excludeIds.filter(Boolean));
  const { category, limit } = params;

  let pool = category ? all.filter((product) => product.category === category) : [...all];
  pool = pool.filter((product) => !exclude.has(product.id));

  if (pool.length < limit) {
    pool = all.filter((product) => !exclude.has(product.id));
  }

  const shuffled = seededShuffle(pool, params.seed);
  return shuffled.slice(0, limit);
};
