import { trendingProducts as fallbackProducts } from '../src/data/trendingProducts';
import type { Product, ProductAttribute } from '../src/types';
import { isRenderableProduct, normalizeProduct } from '../src/utils/dataGenerator';

type VercelRequestLike = {
  method?: string;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
};

type CategorySource = {
  key: string;
  category: string;
  url: string;
  maxItems: number;
};

type ScrapedRankingItem = {
  itemId: string;
  name: string;
  category: string;
  rank: number;
  reviewCount: number;
  image?: string;
  itemUrl: string;
};

type AnchorCandidate = {
  itemId: string;
  name: string;
  itemUrl: string;
  htmlIndex: number;
};

const CATEGORY_SOURCES: CategorySource[] = [
  {
    key: 'phones',
    category: '手机数码',
    url: 'https://www.jd.com/phb/key_998773de14f96f780bd2.html',
    maxItems: 6,
  },
  {
    key: 'laptops',
    category: '电脑办公',
    url: 'https://www.jd.com/phb/key_670b1ea22cbfeb745f8.html',
    maxItems: 6,
  },
  {
    key: 'appliances',
    category: '家用电器',
    url: 'https://www.jd.com/phb/737c63244f7783f5ffb.html',
    maxItems: 6,
  },
  {
    key: 'beauty',
    category: '美妆护肤',
    url: 'https://www.jd.com/phb/key_131604e14b74efe655de.html',
    maxItems: 6,
  },
  {
    key: 'sports',
    category: '运动户外',
    url: 'https://www.jd.com/phb/key_117297e2e135b8cae491a.html',
    maxItems: 6,
  },
  {
    key: 'car',
    category: '汽车用品',
    url: 'https://www.jd.com/phb/key_6728de69bcd54189e25e.html',
    maxItems: 6,
  },
];

const FETCH_TIMEOUT_MS = 5500;
const MINIMUM_LIVE_PRODUCTS = 12;

const groupedFallbackProducts = CATEGORY_SOURCES.reduce<Record<string, Product[]>>((map, source) => {
  map[source.category] = fallbackProducts.filter((product) => product.category === source.category);
  return map;
}, {});

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const buildFallbackResponse = () => fallbackProducts.map(normalizeProduct).filter(isRenderableProduct);

const cleanText = (value: string): string =>
  decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const decodeHtml = (value: string): string =>
  value
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

const toPlainText = (html: string): string =>
  cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' '),
  );

const parseChineseCount = (value: string): number => {
  const normalized = value.replace(/\+/g, '').trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  if (normalized.endsWith('万')) {
    return Math.round(Number(normalized.replace('万', '')) * 10000);
  }

  if (normalized.endsWith('亿')) {
    return Math.round(Number(normalized.replace('亿', '')) * 100000000);
  }

  const numeric = Number(normalized.replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? Math.round(numeric) : 0;
};

const normalizeImageUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  return url.startsWith('https://') ? url : undefined;
};

const extractProductAnchors = (html: string): AnchorCandidate[] => {
  const anchorRegex =
    /<a[^>]+href=["']((?:https?:)?\/\/item\.jd\.com\/(\d+)\.html[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const bySku = new Map<string, AnchorCandidate>();
  const matches: AnchorCandidate[] = [];

  for (const match of html.matchAll(anchorRegex)) {
    const itemUrl = normalizeImageUrl(match[1]?.replace(/\/\/item\.jd\.com/i, '//item.jd.com')) ?? `https:${match[1]}`;
    const itemId = match[2] ?? '';
    const name = cleanText(match[3] ?? '');

    if (!itemId || !name || name.length < 6) {
      continue;
    }

    if (!/[\u4e00-\u9fa5A-Za-z]/.test(name)) {
      continue;
    }

    if (/^(首页|排行|品牌|热卖商品|热门点评晒单|查看|更多|Image:)/.test(name)) {
      continue;
    }

    const existing = bySku.get(itemId);
    const nextCandidate: AnchorCandidate = {
      itemId,
      name,
      itemUrl,
      htmlIndex: match.index ?? 0,
    };

    if (!existing || existing.name.length < name.length) {
      bySku.set(itemId, nextCandidate);
    }
  }

  for (const candidate of bySku.values()) {
    matches.push(candidate);
  }

  return matches.sort((left, right) => left.htmlIndex - right.htmlIndex);
};

const extractReviewCountNearIndex = (html: string, startIndex: number): number => {
  const snippet = toPlainText(html.slice(startIndex, startIndex + 1800));
  const match = snippet.match(/已有\s*([0-9.+万亿]+)\s*人评论/);

  return match ? parseChineseCount(match[1]) : 0;
};

const extractImageNearIndex = (html: string, startIndex: number): string | undefined => {
  const snippet = html.slice(startIndex, startIndex + 2200);
  const imageRegex = /(?:data-lazy-img|data-img|src)=["']([^"']+)["']/gi;

  for (const match of snippet.matchAll(imageRegex)) {
    const normalized = normalizeImageUrl(match[1]);

    if (normalized && /(?:360buyimg|img\d+\.jpg|img\d+\.png|jfs)/i.test(normalized) && !/lazyload|blank/i.test(normalized)) {
      return normalized;
    }
  }

  return undefined;
};

const canonicalizeProductName = (name: string, category: string): string => {
  let normalized = name
    .replace(/【[^】]*】/g, ' ')
    .replace(/〖[^〗]*〗/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/\b(?:64|128|256|512)GB\b/gi, ' ')
    .replace(/\b1TB\b/gi, ' ')
    .replace(/\b\d+(?:\.\d+)?(?:ml|mL|L|匹|Hz|K|kg|寸)\b/gi, ' ')
    .replace(/\b(?:黑|白|灰|蓝|银|金|红|绿|紫)\b/g, ' ')
    .replace(/\b(?:男|女|儿童)\b/g, ' ')
    .replace(/\b(?:3[5-9]|4[0-9])(?:\.\d)?\b/g, category === '运动户外' ? ' ' : '$&')
    .replace(/\s+/g, ' ')
    .trim();

  if (category === '运动户外') {
    normalized = normalized.replace(/\b(?:跑步鞋|运动鞋)\b/g, '跑鞋').trim();
  }

  return normalized;
};

const chooseFallbackTemplate = (category: string, name: string, rank: number): Product => {
  const templates = groupedFallbackProducts[category] ?? fallbackProducts;
  const brandToken = name.split(/[ （(]/)[0]?.trim();
  const matchedTemplate = templates.find((product) => brandToken && product.name.includes(brandToken));

  return matchedTemplate ?? templates[(rank - 1) % templates.length] ?? fallbackProducts[0];
};

const inferPriceFromName = (category: string, name: string, fallbackPrice: number): number => {
  const storageMatch = name.match(/\b(128|256|512)GB\b/i);
  const has1Tb = /\b1TB\b/i.test(name);

  if (category === '手机数码') {
    let basePrice = fallbackPrice;

    if (/iPhone/i.test(name) && /Pro Max/i.test(name)) basePrice = 9999;
    else if (/iPhone/i.test(name) && /Pro/i.test(name)) basePrice = 7999;
    else if (/iPhone/i.test(name)) basePrice = 5999;
    else if (/华为/i.test(name) && /(Pura|Mate|Ultra)/i.test(name)) basePrice = 5599;
    else if (/华为/i.test(name)) basePrice = 3999;
    else if (/小米/i.test(name) && /(Ultra|Pro)/i.test(name)) basePrice = 4999;
    else if (/(小米|vivo|OPPO|荣耀)/i.test(name)) basePrice = 3599;
    else if (/(REDMI|iQOO|真我|realme)/i.test(name)) basePrice = 2299;

    if (storageMatch) {
      if (storageMatch[1] === '512') basePrice += 700;
      if (storageMatch[1] === '256') basePrice += 200;
    }

    if (has1Tb) {
      basePrice += 1600;
    }

    return basePrice;
  }

  if (category === '电脑办公') {
    if (/5090/i.test(name)) return 14999;
    if (/5080/i.test(name)) return 11999;
    if (/5070/i.test(name)) return 9299;
    if (/5060/i.test(name)) return 7499;
    if (/4060/i.test(name)) return 6499;
    if (/ThinkBook|轻薄/i.test(name)) return 5999;
    return fallbackPrice;
  }

  if (category === '家用电器') {
    if (/冰箱/i.test(name)) {
      if (/5\d{2}L/i.test(name)) return 3899;
      if (/4\d{2}L/i.test(name)) return 3299;
      return 2699;
    }

    if (/洗烘|洗衣机/i.test(name)) {
      return /洗烘/i.test(name) ? 2999 : 1699;
    }

    if (/空调/i.test(name)) return 2399;
    if (/电视/i.test(name)) return 2999;
    return fallbackPrice;
  }

  if (category === '美妆护肤') {
    if (/LA MER|海蓝之谜/i.test(name)) return 1599;
    if (/SK-II|神仙水/i.test(name)) return 1099;
    if (/兰蔻/i.test(name)) return 1080;
    if (/雅诗兰黛/i.test(name)) return 420;
    if (/防晒/i.test(name)) return 219;
    return fallbackPrice;
  }

  if (category === '运动户外') {
    if (/耐克|NIKE/i.test(name)) return 499;
    if (/阿迪|adidas/i.test(name)) return 459;
    if (/手表|WATCH/i.test(name)) return 999;
    if (/帐篷|天幕/i.test(name)) return 799;
    return fallbackPrice;
  }

  if (category === '汽车用品') {
    if (/4K/i.test(name)) return 449;
    if (/3K/i.test(name)) return 279;
    if (/双录/i.test(name)) return 699;
    return fallbackPrice;
  }

  return fallbackPrice;
};

const buildAttributes = (template: Product, category: string, name: string): ProductAttribute[] => {
  if (category === '手机数码') {
    const storageOptions = ['128GB', '256GB', '512GB', '1TB']
      .filter((option) => option === '256GB' || option === '512GB' || option === '1TB' || name.includes(option))
      .map((label) => ({ value: label.toLowerCase(), label }));

    return [
      template.attributes.find((attribute) => attribute.name === '颜色') ?? {
        name: '颜色',
        type: 'color',
        options: [
          { value: 'black', label: '曜石黑' },
          { value: 'white', label: '雪域白' },
          { value: 'blue', label: '海湾蓝' },
        ],
      },
      {
        name: '存储',
        type: 'specification',
        options: storageOptions.length > 0 ? storageOptions : [{ value: '256gb', label: '256GB' }],
      },
    ];
  }

  return template.attributes;
};

const inferStock = (itemId: string, rank: number): number => {
  const seed = Number(itemId.slice(-3)) || rank * 17;
  return Math.max(8, (seed % 88) + 8);
};

const inferRating = (reviewCount: number, rank: number): number => {
  const reviewBonus = reviewCount >= 500000 ? 0.2 : reviewCount >= 100000 ? 0.12 : 0.04;
  const rating = 4.45 + reviewBonus - rank * 0.03;
  return Number(Math.max(4.4, Math.min(4.9, rating)).toFixed(1));
};

const buildDescription = (category: string, rank: number, name: string): string => {
  const categoryPitch: Record<string, string> = {
    手机数码: '兼顾热度、口碑与换新关注度',
    电脑办公: '适合办公、创作和高性能娱乐需求',
    家用电器: '适合近期家电换新与国补会场选购',
    美妆护肤: '在礼盒、自用和回购场景里都很热门',
    运动户外: '近期训练、跑步和户外露营搜索热度较高',
    汽车用品: '装车即用，夜视和稳定性是高频卖点',
  };

  return `来自京东${category}排行榜的实时热卖商品，当前位列 TOP ${rank}，${categoryPitch[category] ?? '适合近期直接下单'}。${name}`;
};

const buildLiveProducts = (items: ScrapedRankingItem[]): Product[] => {
  const products = items.map((item) => {
    const template = chooseFallbackTemplate(item.category, item.name, item.rank);
    const price = inferPriceFromName(item.category, item.name, template.price);
    const images = [item.image, ...template.images].filter((value): value is string => Boolean(value));
    const originalPrice =
      template.originalPrice && template.originalPrice > price
        ? template.originalPrice
        : Math.round(price * 1.12);

    return normalizeProduct({
      ...template,
      id: `jd-${item.category}-${item.itemId}`,
      name: item.name,
      category: item.category,
      description: buildDescription(item.category, item.rank, item.name),
      price,
      originalPrice,
      images,
      attributes: buildAttributes(template, item.category, item.name),
      stock: inferStock(item.itemId, item.rank),
      rating: inferRating(item.reviewCount, item.rank),
      reviewCount: item.reviewCount > 0 ? item.reviewCount : template.reviewCount,
    });
  });

  const seen = new Set<string>();

  return products.filter((product) => {
    if (!isRenderableProduct(product)) {
      return false;
    }

    const key = `${product.category}:${canonicalizeProductName(product.name, product.category)}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const fetchHtml = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const scrapeCategoryProducts = async (source: CategorySource): Promise<Product[]> => {
  const html = await fetchHtml(source.url);
  const anchors = extractProductAnchors(html);
  const items: ScrapedRankingItem[] = [];
  const seenNames = new Set<string>();

  for (const anchor of anchors) {
    const normalizedName = canonicalizeProductName(anchor.name, source.category);

    if (!normalizedName || seenNames.has(normalizedName)) {
      continue;
    }

    seenNames.add(normalizedName);

    items.push({
      itemId: anchor.itemId,
      name: anchor.name,
      category: source.category,
      rank: items.length + 1,
      reviewCount: extractReviewCountNearIndex(html, anchor.htmlIndex),
      image: extractImageNearIndex(html, anchor.htmlIndex),
      itemUrl: anchor.itemUrl,
    });

    if (items.length >= source.maxItems) {
      break;
    }
  }

  return buildLiveProducts(items);
};

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method && req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const results = await Promise.allSettled(CATEGORY_SOURCES.map((source) => scrapeCategoryProducts(source)));
    const liveProducts = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

    if (liveProducts.length < MINIMUM_LIVE_PRODUCTS) {
      res.status(200).json(buildFallbackResponse());
      return;
    }

    res.status(200).json(liveProducts);
  } catch (error) {
    console.error('Failed to build live trending products', error);
    res.status(200).json(buildFallbackResponse());
  }
}
