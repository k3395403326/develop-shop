import { Product, ProductAttribute } from '../types';
import { generateProductImages } from '../utils/imageUtils';
import { normalizeProduct } from '../utils/dataGenerator';

type ProductSeed = {
  category: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  attributes: ProductAttribute[];
};

const phoneColors = [
  { value: 'black', label: '曜石黑' },
  { value: 'white', label: '雪域白' },
  { value: 'blue', label: '海湾蓝' },
  { value: 'gold', label: '流沙金' },
];

const phoneStorage = [
  { value: '256gb', label: '256GB' },
  { value: '512gb', label: '512GB' },
  { value: '1tb', label: '1TB' },
];

const laptopConfigs = [
  { value: '16gb-1tb', label: '16GB + 1TB' },
  { value: '32gb-1tb', label: '32GB + 1TB' },
  { value: '32gb-2tb', label: '32GB + 2TB' },
];

const appliancePlans = [
  { value: 'national-subsidy', label: '国补到手价' },
  { value: 'install-service', label: '含送装服务' },
];

const beautyPlans = [
  { value: 'single', label: '单品装' },
  { value: 'gift-box', label: '礼盒装' },
];

const sportPlans = [
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '进阶版' },
];

const carPlans = [
  { value: 'single-record', label: '单录版' },
  { value: 'front-rear', label: '前后双录' },
];

const withColor = (specs: { value: string; label: string }[]): ProductAttribute[] => [
  { name: '颜色', type: 'color', options: phoneColors },
  { name: '版本', type: 'specification', options: specs },
];

const withSpec = (
  name: string,
  options: { value: string; label: string }[],
  includeColor = false,
): ProductAttribute[] =>
  includeColor
    ? [
        { name: '颜色', type: 'color', options: phoneColors.slice(0, 3) },
        { name, type: 'specification', options },
      ]
    : [{ name, type: 'specification', options }];

const hotProductSeeds: ProductSeed[] = [
  {
    category: '手机数码',
    name: '华为 nova 14 Ultra 512GB',
    description: '近期京东华为系列榜单里的高热度机型，主打全焦段影像、鸿蒙 AI 和旗舰质感。',
    price: 4599,
    originalPrice: 4999,
    rating: 4.9,
    reviewCount: 50000,
    stock: 36,
    attributes: withColor(phoneStorage),
  },
  {
    category: '手机数码',
    name: '华为 nova 15 256GB',
    description: '新一代 nova 系列热卖款，兼顾人像拍摄、快充和日常流畅度，适合主力机换新。',
    price: 3799,
    originalPrice: 4299,
    rating: 4.8,
    reviewCount: 50000,
    stock: 52,
    attributes: withColor(phoneStorage),
  },
  {
    category: '手机数码',
    name: '小米 15 Pro 16GB+512GB',
    description: '小米榜单常驻爆款，徕卡影像和高性能平台兼顾，国补后关注度很高。',
    price: 5299,
    originalPrice: 5799,
    rating: 4.8,
    reviewCount: 200000,
    stock: 41,
    attributes: withColor(phoneStorage),
  },
  {
    category: '手机数码',
    name: '小米 15 12GB+512GB',
    description: '小屏旗舰人气机型，手感和续航兼顾，在京东热卖榜里评价量持续增长。',
    price: 4499,
    originalPrice: 4799,
    rating: 4.8,
    reviewCount: 500000,
    stock: 64,
    attributes: withColor(phoneStorage),
  },
  {
    category: '手机数码',
    name: 'REDMI Note 15 Pro 8GB+256GB',
    description: '千元档热销代表，主打大电池、抗摔和高性价比，适合作为入门换机选择。',
    price: 1999,
    originalPrice: 2299,
    rating: 4.7,
    reviewCount: 100000,
    stock: 78,
    attributes: withColor(phoneStorage.slice(0, 2)),
  },
  {
    category: '手机数码',
    name: 'vivo X200 12GB+512GB',
    description: '拍照和长焦表现讨论度很高，蓝海电池和蔡司影像让它在高端榜单里非常能打。',
    price: 4299,
    originalPrice: 4699,
    rating: 4.8,
    reviewCount: 100000,
    stock: 39,
    attributes: withColor(phoneStorage),
  },
  {
    category: '电脑办公',
    name: '机械革命 极光X i7-13700HX RTX5060',
    description: '近期游戏本热榜里的高热度单品，2.5K 高刷屏和 RTX 5060 是核心卖点。',
    price: 6999,
    originalPrice: 7699,
    rating: 4.8,
    reviewCount: 500000,
    stock: 27,
    attributes: withSpec('配置', laptopConfigs, true),
  },
  {
    category: '电脑办公',
    name: '机械革命 蛟龙16 Pro R9 RTX5060',
    description: '蛟龙系列在 2026 热卖榜里讨论度很高，适合游戏、建模和重度办公一机搞定。',
    price: 7599,
    originalPrice: 8299,
    rating: 4.8,
    reviewCount: 5000,
    stock: 22,
    attributes: withSpec('配置', laptopConfigs, true),
  },
  {
    category: '电脑办公',
    name: '惠普 暗影精灵11 R9 RTX5060',
    description: '暗影精灵 11 在京东游戏本榜单热度稳定，散热、屏幕和品牌口碑都很强。',
    price: 7999,
    originalPrice: 8799,
    rating: 4.8,
    reviewCount: 20000,
    stock: 19,
    attributes: withSpec('配置', laptopConfigs, true),
  },
  {
    category: '电脑办公',
    name: '惠普 暗影精灵11 i7 RTX5060',
    description: '更偏均衡的一档配置，适合既想玩大型游戏又兼顾办公和设计的用户。',
    price: 7499,
    originalPrice: 8099,
    rating: 4.7,
    reviewCount: 50000,
    stock: 31,
    attributes: withSpec('配置', laptopConfigs, true),
  },
  {
    category: '电脑办公',
    name: '暗影精灵 MAX AI 高静版',
    description: 'AI 游戏本话题度很高，32GB 内存和高静音设计更适合进阶玩家。',
    price: 8999,
    originalPrice: 9599,
    rating: 4.7,
    reviewCount: 5000,
    stock: 14,
    attributes: withSpec('配置', laptopConfigs, true),
  },
  {
    category: '家用电器',
    name: '海尔 家宴系列 465L 十字门冰箱',
    description: '海尔冰箱热卖榜头部款，容量和母婴分储都很受欢迎，晒单量非常高。',
    price: 3299,
    originalPrice: 3799,
    rating: 4.9,
    reviewCount: 1000000,
    stock: 16,
    attributes: withSpec('方案', appliancePlans),
  },
  {
    category: '家用电器',
    name: '海尔 家宴系列 539L 变温冰箱',
    description: '大容量和黑金净化是这款的高频关键词，适合一步到位升级厨房储鲜。',
    price: 3899,
    originalPrice: 4499,
    rating: 4.9,
    reviewCount: 1000000,
    stock: 13,
    attributes: withSpec('方案', appliancePlans),
  },
  {
    category: '家用电器',
    name: '小天鹅 TD100APUREPRO 洗烘一体机',
    description: '洗烘榜常驻爆款，超薄 10KG 和支持鸿蒙智联让它在家庭用户里很受欢迎。',
    price: 2999,
    originalPrice: 3499,
    rating: 4.8,
    reviewCount: 100000,
    stock: 24,
    attributes: withSpec('方案', appliancePlans),
  },
  {
    category: '家用电器',
    name: 'TCL 京东联名 B80L2R 波轮洗衣机',
    description: '宿舍和出租房热卖机型，价格友好、安装简单，是近期榜单里非常典型的爆款。',
    price: 699,
    originalPrice: 799,
    rating: 4.7,
    reviewCount: 2000000,
    stock: 67,
    attributes: withSpec('方案', appliancePlans),
  },
  {
    category: '家用电器',
    name: 'TCL 真省电 1.5匹 联名空调',
    description: '京东联名空调热卖款，送装一体和新一级能效让它在换季会场热度很高。',
    price: 2399,
    originalPrice: 2799,
    rating: 4.8,
    reviewCount: 500000,
    stock: 26,
    attributes: withSpec('方案', appliancePlans),
  },
  {
    category: '美妆护肤',
    name: '兰蔻 超修小黑瓶精华 50ml',
    description: '京东面部精华榜的经典热卖款，抗老与维稳口碑稳定，礼盒装关注度很高。',
    price: 1080,
    originalPrice: 1260,
    rating: 4.9,
    reviewCount: 1000000,
    stock: 44,
    attributes: withSpec('规格', beautyPlans),
  },
  {
    category: '美妆护肤',
    name: '兰蔻 超修小黑瓶眼霜 20ml',
    description: '眼部护理榜的人气产品，送礼和自用都很常见，回购评价非常密集。',
    price: 520,
    originalPrice: 620,
    rating: 4.8,
    reviewCount: 200000,
    stock: 58,
    attributes: withSpec('规格', beautyPlans),
  },
  {
    category: '美妆护肤',
    name: '珀莱雅 红宝石面霜 50g',
    description: '国货护肤里的超级爆款，轻润和滋润版本都长期占据面霜热榜前列。',
    price: 339,
    originalPrice: 399,
    rating: 4.9,
    reviewCount: 1000000,
    stock: 86,
    attributes: withSpec('规格', beautyPlans),
  },
  {
    category: '美妆护肤',
    name: '安热沙 小金瓶防晒霜 60ml',
    description: '防晒榜常年头部款，成膜快、耐晒强，是春夏会场里点击率极高的单品。',
    price: 219,
    originalPrice: 259,
    rating: 4.9,
    reviewCount: 3000000,
    stock: 95,
    attributes: withSpec('规格', beautyPlans),
  },
  {
    category: '美妆护肤',
    name: '雅诗兰黛 DW 持妆粉底液 30ml',
    description: '油皮底妆人气选手，控油和持妆表现稳定，在粉底液榜单里热度一直很高。',
    price: 420,
    originalPrice: 520,
    rating: 4.8,
    reviewCount: 1000000,
    stock: 42,
    attributes: withSpec('规格', beautyPlans),
  },
  {
    category: '运动户外',
    name: '特步 两千公里五代 跑鞋',
    description: '近期跑鞋热卖榜冠军款，轻便耐磨、适合体测和日常训练，口碑很集中。',
    price: 259,
    originalPrice: 329,
    rating: 4.8,
    reviewCount: 50000,
    stock: 73,
    attributes: withSpec('版本', sportPlans),
  },
  {
    category: '运动户外',
    name: '安踏 毒刺7代 缓震跑鞋',
    description: '国产跑鞋里讨论度很高的一款，脚感轻快，适合慢跑和通勤通穿。',
    price: 299,
    originalPrice: 359,
    rating: 4.8,
    reviewCount: 20000,
    stock: 61,
    attributes: withSpec('版本', sportPlans),
  },
  {
    category: '运动户外',
    name: '华为 WATCH FIT 4 智能运动手表',
    description: '运动手表榜热门款，健康监测、NFC 和轻量佩戴体验都很受欢迎。',
    price: 999,
    originalPrice: 1199,
    rating: 4.7,
    reviewCount: 1000,
    stock: 28,
    attributes: withSpec('版本', sportPlans),
  },
  {
    category: '运动户外',
    name: '牧高笛 零动155 自动帐篷',
    description: '露营会场里的高频爆款，帐篷天幕二合一，适合周末短途露营快速搭建。',
    price: 799,
    originalPrice: 959,
    rating: 4.8,
    reviewCount: 50000,
    stock: 34,
    attributes: withSpec('版本', sportPlans),
  },
  {
    category: '汽车用品',
    name: '70迈 A400 Pro 4K 行车记录仪',
    description: '70迈榜单头部产品，4K 夜视和停车监控能力很强，是很多车主的首选。',
    price: 449,
    originalPrice: 529,
    rating: 4.8,
    reviewCount: 50000,
    stock: 88,
    attributes: withSpec('套餐', carPlans),
  },
  {
    category: '汽车用品',
    name: '70迈 M310 Pro 3K 行车记录仪',
    description: '性价比极高的热门记录仪，旋转机身和星光夜视让它长期挂在热卖榜前排。',
    price: 279,
    originalPrice: 329,
    rating: 4.8,
    reviewCount: 200000,
    stock: 97,
    attributes: withSpec('套餐', carPlans),
  },
  {
    category: '汽车用品',
    name: '海康威视 N6+ 双录流媒体记录仪',
    description: '双录需求里的高热度选择，品牌信任度高，适合更重视停车监控的用户。',
    price: 699,
    originalPrice: 799,
    rating: 4.7,
    reviewCount: 100000,
    stock: 25,
    attributes: withSpec('套餐', carPlans),
  },
  {
    category: '汽车用品',
    name: '360 M320 前后双录记录仪',
    description: '夜视清晰和手机互联是它的核心卖点，在京东汽车用品榜里点击率很高。',
    price: 389,
    originalPrice: 459,
    rating: 4.7,
    reviewCount: 200000,
    stock: 48,
    attributes: withSpec('套餐', carPlans),
  },
];

export const trendingProducts: Product[] = hotProductSeeds.map((seed, index) =>
  normalizeProduct({
    id: `hot-${index + 1}`,
    name: seed.name,
    category: seed.category,
    description: seed.description,
    price: seed.price,
    originalPrice: seed.originalPrice,
    images: generateProductImages(`hot-${index + 1}`, seed.category, seed.name),
    attributes: seed.attributes,
    stock: seed.stock,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
  }),
);
