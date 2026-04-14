import { Product, ProductAttribute } from '../types';
import { generateProductImages } from './imageUtils';

export const categories = [
  '手机数码',
  '电脑办公',
  '家用电器',
  '服饰内衣',
  '家居家装',
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

const sizeOptions = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
];

const storageOptions = [
  { value: '128gb', label: '128GB' },
  { value: '256gb', label: '256GB' },
  { value: '512gb', label: '512GB' },
  { value: '1tb', label: '1TB' },
];

const productNameTemplates: Record<string, string[]> = {
  手机数码: ['iPhone 15 Pro', 'Mate 60 Pro', 'X100 Pro', 'Find X7', '小米 14 Ultra', 'Galaxy S24'],
  电脑办公: ['MacBook Pro 14', 'ThinkPad X1', 'ROG 幻 16', 'Surface Laptop', 'iPad Pro 11', '戴尔 XPS 13'],
  家用电器: ['超薄冰箱', '智能空调', '滚筒洗衣机', '65 英寸电视', '洗烘一体机', '扫拖机器人'],
  服饰内衣: ['轻暖羽绒服', '跑步运动鞋', '针织开衫', '工装长裤', '休闲卫衣', '牛仔夹克'],
  家居家装: ['原木书桌', '护脊床垫', '人体工学椅', '静音台灯', '净水器', '收纳边柜'],
  美妆护肤: ['修护精华', '高保湿面霜', '轻透粉底液', '防晒乳', '香氛身体乳', '舒缓洁面'],
  运动户外: ['专业跑鞋', '速干外套', '登山双肩包', '运动手表', '训练短裤', '露营天幕'],
  汽车用品: ['行车记录仪', '车载香氛', '应急电源', '胎压监测器', '无线吸尘器', '玻璃修复剂'],
};

const priceRanges: Record<string, { min: number; max: number }> = {
  手机数码: { min: 2499, max: 9999 },
  电脑办公: { min: 2999, max: 15999 },
  家用电器: { min: 399, max: 6999 },
  服饰内衣: { min: 79, max: 899 },
  家居家装: { min: 99, max: 4999 },
  美妆护肤: { min: 59, max: 899 },
  运动户外: { min: 129, max: 2999 },
  汽车用品: { min: 49, max: 2599 },
};

const categoryHighlights: Record<string, string[]> = {
  手机数码: ['高刷屏幕', '旗舰芯片', '全天续航'],
  电脑办公: ['高效办公', '轻薄便携', '稳定散热'],
  家用电器: ['节能省电', '低噪运行', '智能联动'],
  服饰内衣: ['舒适亲肤', '版型利落', '四季百搭'],
  家居家装: ['做工扎实', '空间友好', '日常耐用'],
  美妆护肤: ['温和配方', '肤感轻盈', '通勤友好'],
  运动户外: ['轻量耐磨', '透气支撑', '户外实用'],
  汽车用品: ['安装便捷', '车内整洁', '出行安心'],
};

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T,>(items: T[]): T => items[randomInt(0, items.length - 1)];

const pickMany = <T,>(items: T[], minCount: number, maxCount: number): T[] => {
  const count = Math.min(items.length, randomInt(minCount, maxCount));
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
};

const buildDescription = (name: string, category: string): string => {
  const highlights = pickMany(categoryHighlights[category] ?? ['品质稳定', '现货直发', '适合日常'], 2, 3);

  return `${name} 采用 ${highlights.join('、')} 的配置思路，适合日常使用、送礼或自用，整体体验更稳妥。`;
};

const generatePrice = (category: string): { price: number; originalPrice?: number } => {
  const range = priceRanges[category] ?? { min: 99, max: 1999 };
  const price = randomInt(range.min, range.max);
  const hasDiscount = Math.random() < 0.6;
  const originalPrice = hasDiscount ? randomInt(price + 80, Math.round(price * 1.35)) : undefined;

  return {
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
  };
};

const generateAttributes = (category: string): ProductAttribute[] => {
  if (category === '服饰内衣') {
    return [
      {
        name: '颜色',
        type: 'color',
        options: pickMany(colorOptions, 3, 5),
      },
      {
        name: '尺码',
        type: 'size',
        options: pickMany(sizeOptions, 3, 5),
      },
    ];
  }

  if (category === '手机数码' || category === '电脑办公') {
    return [
      {
        name: '颜色',
        type: 'color',
        options: pickMany(colorOptions, 3, 5),
      },
      {
        name: category === '手机数码' ? '存储' : '版本',
        type: 'specification',
        options: pickMany(storageOptions, 2, 4),
      },
    ];
  }

  return [
    {
      name: '颜色',
      type: 'color',
      options: pickMany(colorOptions, 2, 4),
    },
  ];
};

export const normalizeProduct = (product: Product): Product => {
  const safeCategory = product.category?.trim() || '精选商品';
  const safeName = product.name?.trim() || `${safeCategory} 单品`;
  const safePrice = Number.isFinite(product.price) && product.price > 0 ? Math.round(product.price) : 99;
  const safeOriginalPrice =
    product.originalPrice && product.originalPrice > safePrice ? Math.round(product.originalPrice) : undefined;
  const safeDescription = product.description?.trim() || buildDescription(safeName, safeCategory);
  const safeImages = product.images.filter((image) => image && image.trim().length > 0);

  return {
    ...product,
    category: safeCategory,
    name: safeName,
    price: safePrice,
    originalPrice: safeOriginalPrice,
    description: safeDescription,
    images: safeImages.length > 0 ? safeImages : generateProductImages(product.id, safeCategory, safeName),
    attributes: product.attributes.filter((attribute) => attribute.options.length > 0),
    stock: Math.max(0, Math.round(product.stock)),
    rating: Math.min(5, Math.max(3.6, Number(product.rating) || 4.5)),
    reviewCount: Math.max(12, Math.round(product.reviewCount || 50)),
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

export const generateProduct = (id: string, category: string): Product => {
  const name = pickOne(productNameTemplates[category] ?? ['精选单品']);
  const { price, originalPrice } = generatePrice(category);
  const product: Product = {
    id,
    name,
    price,
    originalPrice,
    images: generateProductImages(id, category, name),
    description: buildDescription(name, category),
    category,
    attributes: generateAttributes(category),
    stock: Math.random() < 0.08 ? 0 : randomInt(6, 88),
    rating: Number((3.8 + Math.random() * 1.1).toFixed(1)),
    reviewCount: randomInt(36, 2400),
  };

  return normalizeProduct(product);
};

export const generateProducts = (count: number = 48): Product[] =>
  Array.from({ length: count }, (_, index) => {
    const category = pickOne(categories);

    return generateProduct(`product-${index + 1}`, category);
  }).filter(isRenderableProduct);

export const getCategories = (): string[] => [...categories];
