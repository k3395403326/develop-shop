import { Product } from '../types';
import { trendingProducts as fallbackProducts } from '../data/trendingProducts';
import { isRenderableProduct, normalizeProduct } from '../utils/dataGenerator';

const API_TIMEOUT_MS = 6000;

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

export const getFallbackTrendingProducts = (): Product[] =>
  fallbackProducts.map(normalizeProduct).filter(isRenderableProduct);

export const fetchTrendingProducts = async (): Promise<Product[]> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch('/api/trending-products', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trending products: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    const products = normalizeProductList(data);

    if (products.length === 0) {
      throw new Error('Trending products API returned an empty list');
    }

    return products;
  } finally {
    window.clearTimeout(timer);
  }
};
