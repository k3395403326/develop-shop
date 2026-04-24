import { Product, ProductAttribute } from '../types';
import { generateProductImages } from './imageUtils';

const defaultCategories = [
  '手机数码',
  '电脑办公',
  '家用电器',
  '美妆护肤',
  '运动户外',
  '汽车用品',
];

const colorOptions = [
  { value: 'black', label: '曜石黑' },
  { value: 'white', label: '珍珠白' },
  { value: 'blue', label: '海湾蓝' },
  { value: 'red', label: '落日红' },
  { value: 'gold', label: '香槟金' },
  { value: 'silver', label: '月光银' },
];

const storageOptions = [
  { value: '256gb', label: '256GB' },
  { value: '512gb', label: '512GB' },
  { value: '1tb', label: '1TB' },
];

const laptopOptions = [
  { value: '16gb-1tb', label: '16GB + 1TB' },
  { value: '32gb-1tb', label: '32GB + 1TB' },
  { value: '32gb-2tb', label: '32GB + 2TB' },
];

const applianceOptions = [
  { value: 'standard', label: '标准版' },
  { value: 'national-subsidy', label: '国补到手价' },
];

const beautyOptions = [
  { value: 'single', label: '单品装' },
  { value: 'gift-box', label: '礼盒装' },
];

const sportOptions = [
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '进阶版' },
];

const carOptions = [
  { value: 'single-record', label: '单录版' },
  { value: 'front-rear', label: '前后双录' },
];

const fallbackNames: Record<string, string[]> = {
  手机数码: ['小米 15', 'vivo X200', 'REDMI Note 15 Pro'],
  电脑办公: ['机械革命 极光X', '惠普 暗影精灵11', '机械革命 蛟龙16 Pro'],
  家用电器: ['海尔 家宴冰箱', '小天鹅 洗烘一体机', 'TCL 真省电空调'],
  美妆护肤: ['兰蔻 小黑瓶', '珀莱雅 红宝石面霜', '安热沙 小金瓶'],
  运动户外: ['特步 两千公里五代', '安踏 毒刺7代', '牧高笛 零动155'],
  汽车用品: ['70迈 A400 Pro', '360 M320', '海康威视 N6+'],
};

const categoryHighlights: Record<string, string[]> = {
  手机数码: ['热门机型', '国家补贴', '高口碑晒单'],
  电脑办公: ['高性能配置', '电竞办公两用', '热销榜单常驻'],
  家用电器: ['爆款家电', '以旧换新', '次日送装'],
  美妆护肤: ['回购率高', '礼盒热卖', '通勤送礼都合适'],
  运动户外: ['训练露营两相宜', '轻量耐用', '近期热搜高频'],
  汽车用品: ['装车即用', '夜视清晰', '评价数持续增长'],
};

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T,>(items: T[]): T => items[randomInt(0, items.length - 1)];

const buildDescription = (name: string, category: string): string => {
  const highlights = categoryHighlights[category] ?? ['品质稳定', '现货速发', '评价不错'];

  return `${name} 属于 ${category} 会场里的高热度单品，主打 ${highlights.join('、')}，适合近期换新或直接下单。`;
};

const fallbackAttributes = (category: string): ProductAttribute[] => {
  if (category === '手机数码') {
    return [
      { name: '颜色', type: 'color', options: colorOptions.slice(0, 4) },
      { name: '存储', type: 'specification', options: storageOptions },
    ];
  }

  if (category === '电脑办公') {
    return [
      { name: '颜色', type: 'color', options: colorOptions.slice(0, 3) },
      { name: '配置', type: 'specification', options: laptopOptions },
    ];
  }

  if (category === '家用电器') {
    return [{ name: '方案', type: 'specification', options: applianceOptions }];
  }

  if (category === '美妆护肤') {
    return [{ name: '规格', type: 'specification', options: beautyOptions }];
  }

  if (category === '运动户外') {
    return [{ name: '版本', type: 'specification', options: sportOptions }];
  }

  return [{ name: '套餐', type: 'specification', options: carOptions }];
};

const fallbackPriceRange: Record<string, { min: number; max: number }> = {
  手机数码: { min: 1899, max: 5699 },
  电脑办公: { min: 4999, max: 9999 },
  家用电器: { min: 899, max: 4599 },
  美妆护肤: { min: 129, max: 899 },
  运动户外: { min: 199, max: 2499 },
  汽车用品: { min: 199, max: 1499 },
};

const generateFallbackProduct = (id: string, category: string): Product => {
  const priceRange = fallbackPriceRange[category] ?? { min: 199, max: 1999 };
  const price = randomInt(priceRange.min, priceRange.max);
  const originalPrice = Math.round(price * 1.15);
  const name = pickOne(fallbackNames[category] ?? ['精选热卖单品']);

  return normalizeProduct({
    id,
    name,
    price,
    originalPrice,
    images: generateProductImages(id, category, name),
    description: buildDescription(name, category),
    category,
    attributes: fallbackAttributes(category),
    stock: randomInt(8, 96),
    rating: Number((4.5 + Math.random() * 0.4).toFixed(1)),
    reviewCount: randomInt(1200, 200000),
  });
};

export const normalizeProduct = (product: Product): Product => {
  const safeCategory = product.category?.trim() || '精选商品';
  const safeName = product.name?.trim() || `${safeCategory} 单品`;
  const safePrice = Number.isFinite(product.price) && product.price > 0 ? Math.round(product.price) : 99;
  const safeOriginalPrice =
    product.originalPrice && product.originalPrice > safePrice ? Math.round(product.originalPrice) : undefined;
  const safeDescription = product.description?.trim() || buildDescription(safeName, safeCategory);
  const curatedImages = generateProductImages(product.id || safeName, safeCategory, safeName, 4);

  return {
    ...product,
    category: safeCategory,
    name: safeName,
    price: safePrice,
    originalPrice: safeOriginalPrice,
    description: safeDescription,
    images: curatedImages,
    attributes:
      product.attributes.length > 0
        ? product.attributes.filter((attribute) => attribute.options.length > 0)
        : fallbackAttributes(safeCategory),
    stock: Math.max(0, Math.round(product.stock)),
    rating: Math.min(5, Math.max(3.8, Number(product.rating) || 4.7)),
    reviewCount: Math.max(50, Math.round(product.reviewCount || 200)),
  };
};

export const isRenderableProduct = (product: Product): boolean =>
  Boolean(
    product.id?.trim() &&
      product.name?.trim() &&
      product.category?.trim() &&
      Number.isFinite(product.price) &&
      product.price > 0 &&
      product.images.length > 0,
  );

export const generateProducts = (count: number = 24): Product[] =>
  Array.from({ length: count }, (_, index) => {
    const category = defaultCategories[index % defaultCategories.length];

    return generateFallbackProduct(`fallback-${index + 1}`, category);
  }).filter(isRenderableProduct);

export const getCategories = (products: Product[] = []): string[] => {
  const sourceCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));

  return sourceCategories.length > 0 ? sourceCategories : [...defaultCategories];
};
