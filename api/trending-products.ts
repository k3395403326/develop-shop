type VercelRequestLike = {
  method?: string;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
};

type AttributeOption = {
  value: string;
  label: string;
};

type ProductAttribute = {
  name: string;
  type: 'color' | 'size' | 'specification';
  options: AttributeOption[];
};

type ApiProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  attributes: ProductAttribute[];
  stock: number;
  rating: number;
  reviewCount: number;
};

type CategorySource = {
  key: string;
  category: string;
  url: string;
  maxItems: number;
};

type AnchorCandidate = {
  itemId: string;
  name: string;
  htmlIndex: number;
};

type ScrapedRankingItem = {
  itemId: string;
  name: string;
  category: string;
  rank: number;
  reviewCount: number;
  image?: string;
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

const FETCH_TIMEOUT_MS = 5000;
const MINIMUM_LIVE_PRODUCTS = 12;

const colorOptions: AttributeOption[] = [
  { value: 'black', label: '曜石黑' },
  { value: 'white', label: '雪域白' },
  { value: 'blue', label: '海湾蓝' },
];

const phoneStorage: AttributeOption[] = [
  { value: '256gb', label: '256GB' },
  { value: '512gb', label: '512GB' },
  { value: '1tb', label: '1TB' },
];

const laptopConfigs: AttributeOption[] = [
  { value: '16gb-1tb', label: '16GB + 1TB' },
  { value: '32gb-1tb', label: '32GB + 1TB' },
  { value: '32gb-2tb', label: '32GB + 2TB' },
];

const genericSpec: AttributeOption[] = [
  { value: 'standard', label: '标准版' },
  { value: 'popular', label: '热卖款' },
];

const fallbackCatalog: Record<string, ApiProduct[]> = {
  手机数码: [
    {
      id: 'fallback-phone-1',
      name: 'Apple iPhone 17 Pro Max 256GB',
      price: 9999,
      originalPrice: 10999,
      images: [],
      description: '苹果高端机型，热卖榜关注度稳定，适合高预算换新。',
      category: '手机数码',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '存储', type: 'specification', options: phoneStorage },
      ],
      stock: 28,
      rating: 4.8,
      reviewCount: 2000000,
    },
    {
      id: 'fallback-phone-2',
      name: '华为 nova 15 256GB',
      price: 3999,
      originalPrice: 4399,
      images: [],
      description: '华为近期热卖机型，影像和系统体验均衡。',
      category: '手机数码',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '存储', type: 'specification', options: phoneStorage },
      ],
      stock: 42,
      rating: 4.8,
      reviewCount: 680000,
    },
    {
      id: 'fallback-phone-3',
      name: '小米 15 Pro 512GB',
      price: 5299,
      originalPrice: 5799,
      images: [],
      description: '小米热卖旗舰，徕卡影像和性能表现兼顾。',
      category: '手机数码',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '存储', type: 'specification', options: phoneStorage },
      ],
      stock: 36,
      rating: 4.8,
      reviewCount: 520000,
    },
  ],
  电脑办公: [
    {
      id: 'fallback-laptop-1',
      name: '机械革命 极光X RTX5060',
      price: 7499,
      originalPrice: 8099,
      images: [],
      description: '游戏本热卖款，适合高性能娱乐和重度办公。',
      category: '电脑办公',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '配置', type: 'specification', options: laptopConfigs },
      ],
      stock: 19,
      rating: 4.8,
      reviewCount: 460000,
    },
    {
      id: 'fallback-laptop-2',
      name: '惠普 暗影精灵11 RTX5060',
      price: 7999,
      originalPrice: 8799,
      images: [],
      description: '品牌口碑稳定，适合游戏与创作双场景。',
      category: '电脑办公',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '配置', type: 'specification', options: laptopConfigs },
      ],
      stock: 17,
      rating: 4.7,
      reviewCount: 210000,
    },
    {
      id: 'fallback-laptop-3',
      name: '联想 拯救者 R9000P',
      price: 8999,
      originalPrice: 9799,
      images: [],
      description: '高端性能本，屏幕和散热表现都很强。',
      category: '电脑办公',
      attributes: [
        { name: '颜色', type: 'color', options: colorOptions },
        { name: '配置', type: 'specification', options: laptopConfigs },
      ],
      stock: 15,
      rating: 4.8,
      reviewCount: 360000,
    },
  ],
  家用电器: [
    {
      id: 'fallback-appliance-1',
      name: '海尔 465L 十字门冰箱',
      price: 3299,
      originalPrice: 3799,
      images: [],
      description: '海尔冰箱热门型号，适合家庭换新。',
      category: '家用电器',
      attributes: [{ name: '方案', type: 'specification', options: genericSpec }],
      stock: 20,
      rating: 4.9,
      reviewCount: 1000000,
    },
    {
      id: 'fallback-appliance-2',
      name: '小天鹅 洗烘一体机',
      price: 2999,
      originalPrice: 3499,
      images: [],
      description: '洗烘榜热卖机型，适合一步到位。',
      category: '家用电器',
      attributes: [{ name: '方案', type: 'specification', options: genericSpec }],
      stock: 24,
      rating: 4.8,
      reviewCount: 720000,
    },
    {
      id: 'fallback-appliance-3',
      name: 'TCL 真省电 1.5匹空调',
      price: 2399,
      originalPrice: 2799,
      images: [],
      description: '换季热度很高的空调爆款，送装一体。',
      category: '家用电器',
      attributes: [{ name: '方案', type: 'specification', options: genericSpec }],
      stock: 33,
      rating: 4.8,
      reviewCount: 530000,
    },
  ],
  美妆护肤: [
    {
      id: 'fallback-beauty-1',
      name: '兰蔻 小黑瓶精华 50ml',
      price: 1080,
      originalPrice: 1260,
      images: [],
      description: '精华榜头部单品，礼盒和自用都很热门。',
      category: '美妆护肤',
      attributes: [{ name: '规格', type: 'specification', options: genericSpec }],
      stock: 58,
      rating: 4.9,
      reviewCount: 950000,
    },
    {
      id: 'fallback-beauty-2',
      name: '珀莱雅 红宝石面霜',
      price: 339,
      originalPrice: 399,
      images: [],
      description: '国货热卖面霜，回购率很高。',
      category: '美妆护肤',
      attributes: [{ name: '规格', type: 'specification', options: genericSpec }],
      stock: 74,
      rating: 4.9,
      reviewCount: 1200000,
    },
    {
      id: 'fallback-beauty-3',
      name: '安热沙 小金瓶防晒 60ml',
      price: 219,
      originalPrice: 259,
      images: [],
      description: '防晒榜高热单品，春夏关注度持续走高。',
      category: '美妆护肤',
      attributes: [{ name: '规格', type: 'specification', options: genericSpec }],
      stock: 88,
      rating: 4.9,
      reviewCount: 3000000,
    },
  ],
  运动户外: [
    {
      id: 'fallback-sport-1',
      name: '特步 两千公里五代 跑鞋',
      price: 259,
      originalPrice: 329,
      images: [],
      description: '近期跑鞋热卖榜冠军款，适合训练和通勤。',
      category: '运动户外',
      attributes: [{ name: '版本', type: 'specification', options: genericSpec }],
      stock: 66,
      rating: 4.8,
      reviewCount: 520000,
    },
    {
      id: 'fallback-sport-2',
      name: '安踏 毒刺7代 跑鞋',
      price: 299,
      originalPrice: 359,
      images: [],
      description: '国产跑鞋热卖款，脚感轻快。',
      category: '运动户外',
      attributes: [{ name: '版本', type: 'specification', options: genericSpec }],
      stock: 54,
      rating: 4.8,
      reviewCount: 260000,
    },
    {
      id: 'fallback-sport-3',
      name: '华为 WATCH FIT 4',
      price: 999,
      originalPrice: 1199,
      images: [],
      description: '运动手表热门款，健康监测与轻量佩戴兼顾。',
      category: '运动户外',
      attributes: [{ name: '版本', type: 'specification', options: genericSpec }],
      stock: 29,
      rating: 4.7,
      reviewCount: 120000,
    },
  ],
  汽车用品: [
    {
      id: 'fallback-car-1',
      name: '70迈 A400 Pro 4K 行车记录仪',
      price: 449,
      originalPrice: 529,
      images: [],
      description: '记录仪榜头部商品，夜视和停车监控表现稳定。',
      category: '汽车用品',
      attributes: [{ name: '套餐', type: 'specification', options: genericSpec }],
      stock: 80,
      rating: 4.8,
      reviewCount: 560000,
    },
    {
      id: 'fallback-car-2',
      name: '70迈 M310 Pro 3K 行车记录仪',
      price: 279,
      originalPrice: 329,
      images: [],
      description: '高性价比热门记录仪，适合大众装车。',
      category: '汽车用品',
      attributes: [{ name: '套餐', type: 'specification', options: genericSpec }],
      stock: 92,
      rating: 4.8,
      reviewCount: 390000,
    },
    {
      id: 'fallback-car-3',
      name: '海康威视 N6+ 双录记录仪',
      price: 699,
      originalPrice: 799,
      images: [],
      description: '双录需求热门选择，品牌认知度高。',
      category: '汽车用品',
      attributes: [{ name: '套餐', type: 'specification', options: genericSpec }],
      stock: 34,
      rating: 4.7,
      reviewCount: 180000,
    },
  ],
};

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const decodeHtml = (value: string): string =>
  value
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

const cleanText = (value: string): string =>
  decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toPlainText = (html: string): string =>
  cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' '),
  );

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
    .replace(/\s+/g, ' ')
    .trim();

  if (category === '运动户外') {
    normalized = normalized.replace(/\b(?:3[5-9]|4[0-9])(?:\.\d)?\b/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return normalized;
};

const extractProductAnchors = (html: string): AnchorCandidate[] => {
  const anchorRegex =
    /<a[^>]+href=["']((?:https?:)?\/\/item\.jd\.com\/(\d+)\.html[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const bySku = new Map<string, AnchorCandidate>();

  for (const match of html.matchAll(anchorRegex)) {
    const itemId = match[2] ?? '';
    const name = cleanText(match[3] ?? '');

    if (!itemId || !name || name.length < 6 || !/[\u4e00-\u9fa5A-Za-z]/.test(name)) {
      continue;
    }

    if (/^(首页|排行|品牌|热卖商品|热门点评晒单|查看|更多|Image:)/.test(name)) {
      continue;
    }

    const existing = bySku.get(itemId);
    const candidate: AnchorCandidate = {
      itemId,
      name,
      htmlIndex: match.index ?? 0,
    };

    if (!existing || existing.name.length < name.length) {
      bySku.set(itemId, candidate);
    }
  }

  return [...bySku.values()].sort((left, right) => left.htmlIndex - right.htmlIndex);
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

    if (normalized && /(?:360buyimg|jfs)/i.test(normalized) && !/blank|lazyload/i.test(normalized)) {
      return normalized;
    }
  }

  return undefined;
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

    if (storageMatch?.[1] === '256') basePrice += 200;
    if (storageMatch?.[1] === '512') basePrice += 700;
    if (has1Tb) basePrice += 1600;

    return basePrice;
  }

  if (category === '电脑办公') {
    if (/5090/i.test(name)) return 14999;
    if (/5080/i.test(name)) return 11999;
    if (/5070/i.test(name)) return 9299;
    if (/5060/i.test(name)) return 7499;
    if (/4060/i.test(name)) return 6499;
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
    if (/兰蔻/i.test(name)) return 1080;
    if (/雅诗兰黛/i.test(name)) return 420;
    if (/防晒/i.test(name)) return 219;
    return fallbackPrice;
  }

  if (category === '运动户外') {
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

const inferRating = (reviewCount: number, rank: number): number => {
  const reviewBonus = reviewCount >= 500000 ? 0.2 : reviewCount >= 100000 ? 0.12 : 0.04;
  const rating = 4.45 + reviewBonus - rank * 0.03;
  return Number(Math.max(4.4, Math.min(4.9, rating)).toFixed(1));
};

const inferStock = (itemId: string, rank: number): number => {
  const seed = Number(itemId.slice(-3)) || rank * 17;
  return Math.max(8, (seed % 88) + 8);
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

const buildAttributes = (category: string): ProductAttribute[] => {
  if (category === '手机数码') {
    return [
      { name: '颜色', type: 'color', options: colorOptions },
      { name: '存储', type: 'specification', options: phoneStorage },
    ];
  }

  if (category === '电脑办公') {
    return [
      { name: '颜色', type: 'color', options: colorOptions },
      { name: '配置', type: 'specification', options: laptopConfigs },
    ];
  }

  if (category === '家用电器') {
    return [{ name: '方案', type: 'specification', options: genericSpec }];
  }

  if (category === '美妆护肤') {
    return [{ name: '规格', type: 'specification', options: genericSpec }];
  }

  if (category === '运动户外') {
    return [{ name: '版本', type: 'specification', options: genericSpec }];
  }

  return [{ name: '套餐', type: 'specification', options: genericSpec }];
};

const buildFallbackResponse = (): ApiProduct[] =>
  CATEGORY_SOURCES.flatMap((source) => fallbackCatalog[source.category] ?? []);

const buildLiveProducts = (items: ScrapedRankingItem[]): ApiProduct[] => {
  const seen = new Set<string>();

  return items
    .map((item) => {
      const templates = fallbackCatalog[item.category] ?? buildFallbackResponse();
      const template = templates[(item.rank - 1) % templates.length] ?? templates[0];
      const price = inferPriceFromName(item.category, item.name, template.price);

      return {
        ...template,
        id: `jd-${item.category}-${item.itemId}`,
        name: item.name,
        category: item.category,
        description: buildDescription(item.category, item.rank, item.name),
        price,
        originalPrice: Math.round(price * 1.12),
        images: item.image ? [item.image] : [],
        attributes: buildAttributes(item.category),
        stock: inferStock(item.itemId, item.rank),
        rating: inferRating(item.reviewCount, item.rank),
        reviewCount: item.reviewCount > 0 ? item.reviewCount : template.reviewCount,
      };
    })
    .filter((product) => {
      if (!product.id || !product.name || !product.category || !Number.isFinite(product.price) || product.price <= 0) {
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

const scrapeCategoryProducts = async (source: CategorySource): Promise<ApiProduct[]> => {
  const html = await fetchHtml(source.url);
  const anchors = extractProductAnchors(html);
  const seenNames = new Set<string>();
  const items: ScrapedRankingItem[] = [];

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
