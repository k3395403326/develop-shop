type ProductKind = 'phone' | 'laptop' | 'appliance' | 'beauty' | 'outdoor' | 'car';
type ApplianceKind = 'fridge' | 'washer' | 'aircon';
type OutdoorKind = 'shoe' | 'tent' | 'watch';

type Palette = {
  background: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  surface: string;
  shadow: string;
};

const palettes: Record<ProductKind, Palette[]> = {
  phone: [
    { background: '#fff6f3', accent: '#e1251b', accentDark: '#991b1b', accentSoft: '#ffd7cf', surface: '#ffffff', shadow: '#fca5a5' },
    { background: '#eef5ff', accent: '#2563eb', accentDark: '#1d4ed8', accentSoft: '#cfe1ff', surface: '#ffffff', shadow: '#93c5fd' },
    { background: '#f1fbf8', accent: '#0f766e', accentDark: '#115e59', accentSoft: '#c7f0e7', surface: '#ffffff', shadow: '#7dd3c7' },
  ],
  laptop: [
    { background: '#f2f6ff', accent: '#2563eb', accentDark: '#1e3a8a', accentSoft: '#cfddff', surface: '#ffffff', shadow: '#93c5fd' },
    { background: '#f6f3ff', accent: '#6d28d9', accentDark: '#4c1d95', accentSoft: '#ded3ff', surface: '#ffffff', shadow: '#c4b5fd' },
    { background: '#f0fdfa', accent: '#0f766e', accentDark: '#134e4a', accentSoft: '#ccfbf1', surface: '#ffffff', shadow: '#99f6e4' },
  ],
  appliance: [
    { background: '#f2f9ff', accent: '#0891b2', accentDark: '#155e75', accentSoft: '#d4f2fb', surface: '#ffffff', shadow: '#a5f3fc' },
    { background: '#f7f9fc', accent: '#64748b', accentDark: '#334155', accentSoft: '#e2e8f0', surface: '#ffffff', shadow: '#cbd5e1' },
    { background: '#fff7ed', accent: '#f97316', accentDark: '#9a3412', accentSoft: '#fed7aa', surface: '#ffffff', shadow: '#fdba74' },
  ],
  beauty: [
    { background: '#fff4f7', accent: '#db2777', accentDark: '#9d174d', accentSoft: '#ffcfe3', surface: '#ffffff', shadow: '#f9a8d4' },
    { background: '#fff7ed', accent: '#c2410c', accentDark: '#9a3412', accentSoft: '#fed7aa', surface: '#ffffff', shadow: '#fdba74' },
    { background: '#f5f3ff', accent: '#7c3aed', accentDark: '#5b21b6', accentSoft: '#ddd6fe', surface: '#ffffff', shadow: '#c4b5fd' },
  ],
  outdoor: [
    { background: '#f0fdf4', accent: '#16a34a', accentDark: '#14532d', accentSoft: '#bbf7d0', surface: '#ffffff', shadow: '#86efac' },
    { background: '#fffbeb', accent: '#d97706', accentDark: '#92400e', accentSoft: '#fde68a', surface: '#ffffff', shadow: '#fcd34d' },
    { background: '#eff6ff', accent: '#0284c7', accentDark: '#075985', accentSoft: '#bae6fd', surface: '#ffffff', shadow: '#7dd3fc' },
  ],
  car: [
    { background: '#f8fafc', accent: '#111827', accentDark: '#020617', accentSoft: '#dbe4ef', surface: '#ffffff', shadow: '#94a3b8' },
    { background: '#fff4f4', accent: '#dc2626', accentDark: '#7f1d1d', accentSoft: '#fecaca', surface: '#ffffff', shadow: '#fca5a5' },
    { background: '#eff6ff', accent: '#2563eb', accentDark: '#1e3a8a', accentSoft: '#bfdbfe', surface: '#ffffff', shadow: '#93c5fd' },
  ],
};

const hashString = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return Math.abs(hash);
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toSvgDataUri = (svg: string): string => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const getProductKind = (category: string, name: string): ProductKind => {
  const normalized = `${category} ${name}`;

  if (/(手机|iPhone|HUAWEI|华为|小米|REDMI|vivo|OPPO|荣耀|Samsung|三星|nova|X200|Note)/i.test(normalized)) {
    return 'phone';
  }

  if (/(电脑|笔记本|拯救者|MacBook|机械革命|暗影|游戏本|RTX|办公|极光|蛟龙)/i.test(normalized)) {
    return 'laptop';
  }

  if (/(冰箱|洗衣机|洗烘|空调|电视|热水器|净水|扫地机|家电|电器)/i.test(normalized)) {
    return 'appliance';
  }

  if (/(精华|眼霜|面霜|面膜|防晒|粉底|神仙水|口红|彩妆|护肤|美妆|乳液|礼盒|小黑瓶)/i.test(normalized)) {
    return 'beauty';
  }

  if (/(露营|帐篷|跑鞋|球鞋|骑行|冲锋衣|运动|户外|滑板|手表|WATCH|羽毛球|瑜伽)/i.test(normalized)) {
    return 'outdoor';
  }

  return 'car';
};

const getApplianceKind = (name: string): ApplianceKind => {
  if (/(洗衣机|洗烘|波轮|滚筒)/i.test(name)) return 'washer';
  if (/(空调|1\.5匹|挂机)/i.test(name)) return 'aircon';
  return 'fridge';
};

const getOutdoorKind = (name: string): OutdoorKind => {
  if (/(帐篷|露营|天幕|牧高笛)/i.test(name)) return 'tent';
  if (/(手表|WATCH|腕表)/i.test(name)) return 'watch';
  return 'shoe';
};

const getPalette = (category: string, name: string, variant: number): Palette => {
  const kind = getProductKind(category, name);
  const paletteSet = palettes[kind];
  return paletteSet[hashString(`${category}-${name}-${variant}`) % paletteSet.length];
};

const getBadgeText = (category: string): string => {
  if (category.includes('手机')) return '数码热卖';
  if (category.includes('电脑')) return '电脑办公';
  if (category.includes('家电')) return '家电优选';
  if (category.includes('美妆')) return '美妆护肤';
  if (category.includes('运动')) return '运动户外';
  if (category.includes('汽车')) return '汽车用品';
  return '京选好物';
};

const getDisplayLabel = (name: string): string => {
  const englishChunk = name.match(/[A-Za-z0-9][A-Za-z0-9\s.+-]{3,}/)?.[0]?.trim();

  if (englishChunk) {
    return englishChunk.slice(0, 24);
  }

  return name.replace(/\s+/g, '').slice(0, 12);
};

const renderCatalogBackdrop = (palette: Palette, variant: number): string => `
  <rect width="720" height="720" rx="52" fill="${palette.background}" />
  <rect x="64" y="64" width="592" height="592" rx="46" fill="#ffffff" opacity="0.9" />
  <circle cx="${130 + variant * 18}" cy="150" r="96" fill="${palette.accentSoft}" opacity="0.62" />
  <circle cx="${588 - variant * 22}" cy="${210 + variant * 18}" r="76" fill="${palette.shadow}" opacity="0.2" />
  <ellipse cx="360" cy="544" rx="224" ry="38" fill="${palette.shadow}" opacity="0.22" />
`;

const renderTopBadge = (palette: Palette, category: string, name: string): string => {
  const badgeText = escapeXml(getBadgeText(category));
  const label = escapeXml(getDisplayLabel(name));

  return `
    <g transform="translate(78 72)">
      <rect width="132" height="38" rx="19" fill="${palette.accent}" opacity="0.12" />
      <text x="66" y="25" text-anchor="middle" fill="${palette.accentDark}" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="17" font-weight="800">${badgeText}</text>
    </g>
    <text x="78" y="632" fill="#172033" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="30" font-weight="800">${label}</text>
    <text x="78" y="666" fill="#64748b" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="16" font-weight="700">JD STYLE PRODUCT IMAGE</text>
  `;
};

const renderPhone = (palette: Palette, variant: number): string => {
  const frontRotation = [-8, -5, 5, 8][variant % 4];
  const backRotation = [8, 5, -6, -8][variant % 4];

  return `
    <g transform="translate(252 154) rotate(${backRotation})">
      <rect width="218" height="408" rx="42" fill="${palette.accentDark}" />
      <rect x="14" y="14" width="190" height="380" rx="34" fill="${palette.accentSoft}" />
      <rect x="34" y="34" width="92" height="118" rx="28" fill="${palette.surface}" opacity="0.96" />
      <circle cx="72" cy="76" r="18" fill="${palette.accent}" />
      <circle cx="104" cy="76" r="18" fill="${palette.shadow}" />
      <circle cx="88" cy="112" r="18" fill="${palette.accentDark}" opacity="0.78" />
      <rect x="62" y="348" width="96" height="8" rx="4" fill="${palette.accentDark}" opacity="0.2" />
    </g>
    <g transform="translate(332 142) rotate(${frontRotation})">
      <rect width="226" height="424" rx="44" fill="#0f172a" />
      <rect x="13" y="13" width="200" height="398" rx="36" fill="#ffffff" />
      <rect x="27" y="30" width="172" height="354" rx="28" fill="url(#productGlow)" />
      <rect x="56" y="84" width="114" height="18" rx="9" fill="#ffffff" opacity="0.7" />
      <rect x="56" y="122" width="82" height="12" rx="6" fill="#ffffff" opacity="0.42" />
      <rect x="48" y="304" width="130" height="18" rx="9" fill="#ffffff" opacity="0.18" />
      <rect x="78" y="392" width="70" height="8" rx="4" fill="#0f172a" opacity="0.16" />
    </g>
  `;
};

const renderLaptop = (palette: Palette, variant: number): string => {
  const rotation = [-2, -1, 1, 2][variant % 4];

  return `
    <g transform="translate(360 326) rotate(${rotation}) translate(-252 -178)">
      <rect x="50" y="0" width="404" height="254" rx="26" fill="#111827" />
      <rect x="68" y="18" width="368" height="218" rx="18" fill="#ffffff" />
      <rect x="86" y="36" width="332" height="182" rx="14" fill="url(#productGlow)" />
      <circle cx="380" cy="78" r="16" fill="${palette.accentSoft}" opacity="0.7" />
      <rect x="124" y="74" width="184" height="20" rx="10" fill="#ffffff" opacity="0.5" />
      <rect x="124" y="112" width="236" height="14" rx="7" fill="#ffffff" opacity="0.28" />
      <rect x="0" y="258" width="504" height="42" rx="18" fill="#cbd5e1" />
      <path d="M52 300H452L504 342H0L52 300Z" fill="#e2e8f0" />
      <rect x="184" y="310" width="136" height="14" rx="7" fill="#94a3b8" opacity="0.48" />
    </g>
  `;
};

const renderFridge = (palette: Palette): string => `
  <g transform="translate(256 134)">
    <rect width="208" height="426" rx="34" fill="#e2e8f0" />
    <rect x="14" y="14" width="180" height="398" rx="26" fill="url(#applianceBody)" />
    <line x1="104" y1="52" x2="104" y2="372" stroke="#d3dce8" stroke-width="4" />
    <rect x="72" y="166" width="10" height="90" rx="5" fill="${palette.accent}" opacity="0.35" />
    <rect x="126" y="204" width="10" height="90" rx="5" fill="${palette.accent}" opacity="0.35" />
    <rect x="54" y="42" width="100" height="18" rx="9" fill="${palette.accentSoft}" />
  </g>
`;

const renderWasher = (palette: Palette): string => `
  <g transform="translate(238 128)">
    <rect width="244" height="440" rx="36" fill="#e2e8f0" />
    <rect x="18" y="18" width="208" height="404" rx="28" fill="url(#applianceBody)" />
    <rect x="58" y="54" width="128" height="20" rx="10" fill="${palette.accentSoft}" />
    <rect x="82" y="94" width="80" height="10" rx="5" fill="#cbd5e1" />
    <circle cx="122" cy="252" r="91" fill="#dbeafe" />
    <circle cx="122" cy="252" r="68" fill="#ffffff" />
    <circle cx="122" cy="252" r="44" fill="${palette.accentSoft}" />
    <path d="M86 260C108 236 134 236 158 260" stroke="${palette.accent}" stroke-width="11" stroke-linecap="round" fill="none" opacity="0.46" />
  </g>
`;

const renderAircon = (palette: Palette): string => `
  <g transform="translate(116 198)">
    <rect width="488" height="178" rx="34" fill="#e2e8f0" />
    <rect x="18" y="18" width="452" height="142" rx="26" fill="url(#applianceBody)" />
    <rect x="54" y="112" width="380" height="13" rx="7" fill="#cbd5e1" />
    <circle cx="414" cy="64" r="18" fill="${palette.accentSoft}" />
    <rect x="74" y="64" width="170" height="18" rx="9" fill="${palette.accentSoft}" />
    <path d="M164 210C148 238 148 270 166 298M264 210C248 238 248 270 266 298M364 210C348 238 348 270 366 298" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" opacity="0.18" />
  </g>
`;

const renderAppliance = (palette: Palette, name: string): string => {
  const kind = getApplianceKind(name);

  if (kind === 'washer') return renderWasher(palette);
  if (kind === 'aircon') return renderAircon(palette);
  return renderFridge(palette);
};

const renderBeauty = (palette: Palette, variant: number): string => {
  const bottleHeight = 256 + variant * 8;

  return `
    <g transform="translate(178 152)">
      <rect x="34" y="54" width="132" height="${bottleHeight}" rx="36" fill="${palette.accentDark}" opacity="0.94" />
      <rect x="54" y="24" width="92" height="48" rx="22" fill="${palette.accentSoft}" />
      <rect x="56" y="102" width="88" height="112" rx="24" fill="url(#productGlow)" opacity="0.88" />
      <rect x="64" y="254" width="72" height="18" rx="9" fill="#ffffff" opacity="0.26" />
      <rect x="260" y="144" width="184" height="232" rx="38" fill="#ffffff" />
      <rect x="286" y="98" width="132" height="66" rx="33" fill="${palette.accentSoft}" />
      <circle cx="352" cy="264" r="68" fill="${palette.accentSoft}" />
      <circle cx="352" cy="264" r="38" fill="${palette.accent}" opacity="0.58" />
      <rect x="232" y="408" width="248" height="36" rx="18" fill="${palette.accent}" opacity="0.14" />
    </g>
  `;
};

const renderShoe = (palette: Palette): string => `
  <g transform="translate(130 250)">
    <path d="M66 206C118 128 198 82 288 72C320 68 350 92 372 122C400 160 446 162 496 178C538 192 564 224 552 254C540 284 494 298 410 298H122C64 298 34 270 50 232C54 222 58 214 66 206Z" fill="${palette.accentDark}" />
    <path d="M104 214C158 154 216 122 288 112C320 108 342 132 360 158C388 196 432 196 478 208C506 216 526 230 528 246C482 258 414 264 326 264H102C80 264 70 250 78 232C84 224 92 218 104 214Z" fill="url(#productGlow)" />
    <path d="M138 190L236 218M176 162L274 210M224 138L318 198" stroke="#ffffff" stroke-width="13" stroke-linecap="round" opacity="0.55" />
    <rect x="76" y="282" width="472" height="28" rx="14" fill="#e2e8f0" />
  </g>
`;

const renderTent = (palette: Palette): string => `
  <g transform="translate(126 188)">
    <path d="M28 330L240 96L452 330Z" fill="${palette.accent}" />
    <path d="M138 330L240 96L342 330Z" fill="${palette.accentSoft}" opacity="0.9" />
    <path d="M196 330C202 276 220 238 240 216C260 238 278 276 284 330Z" fill="#ffffff" opacity="0.92" />
    <rect x="376" y="140" width="98" height="198" rx="28" fill="#ffffff" />
    <rect x="396" y="168" width="58" height="96" rx="18" fill="${palette.accentSoft}" />
    <ellipse cx="248" cy="354" rx="238" ry="28" fill="${palette.shadow}" opacity="0.24" />
  </g>
`;

const renderWatch = (palette: Palette): string => `
  <g transform="translate(276 104)">
    <rect x="62" y="0" width="72" height="164" rx="34" fill="${palette.accentDark}" />
    <rect x="62" y="356" width="72" height="164" rx="34" fill="${palette.accentDark}" />
    <rect x="0" y="132" width="196" height="252" rx="58" fill="#111827" />
    <rect x="16" y="148" width="164" height="220" rx="46" fill="#ffffff" />
    <rect x="32" y="166" width="132" height="184" rx="36" fill="url(#productGlow)" />
    <circle cx="98" cy="258" r="44" fill="#ffffff" opacity="0.22" />
    <path d="M74 258L94 278L126 230" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.76" />
  </g>
`;

const renderOutdoor = (palette: Palette, name: string): string => {
  const kind = getOutdoorKind(name);

  if (kind === 'tent') return renderTent(palette);
  if (kind === 'watch') return renderWatch(palette);
  return renderShoe(palette);
};

const renderCar = (palette: Palette, variant: number): string => {
  const rotation = [7, 12, 18, 24][variant % 4];

  return `
    <g transform="translate(154 166)">
      <g transform="translate(294 20)">
        <rect width="136" height="226" rx="32" fill="#111827" />
        <rect x="18" y="18" width="100" height="142" rx="22" fill="url(#productGlow)" />
        <circle cx="68" cy="126" r="20" fill="#ffffff" opacity="0.9" />
        <rect x="42" y="176" width="52" height="12" rx="6" fill="#ffffff" opacity="0.28" />
      </g>
      <g transform="translate(104 132) rotate(${rotation}) translate(-104 -104)">
        <circle cx="104" cy="104" r="104" fill="#111827" />
        <circle cx="104" cy="104" r="68" fill="#e2e8f0" />
        <circle cx="104" cy="104" r="30" fill="${palette.accent}" />
      </g>
      <path d="M42 366C84 302 150 270 240 270C332 270 394 302 438 366H42Z" fill="${palette.accent}" opacity="0.2" />
      <path d="M88 352C124 316 174 298 240 298C308 298 356 316 394 352" stroke="${palette.accent}" stroke-width="26" stroke-linecap="round" fill="none" />
    </g>
  `;
};

const renderProduct = (category: string, name: string, variant: number, palette: Palette): string => {
  const kind = getProductKind(category, name);

  switch (kind) {
    case 'phone':
      return renderPhone(palette, variant);
    case 'laptop':
      return renderLaptop(palette, variant);
    case 'appliance':
      return renderAppliance(palette, name);
    case 'beauty':
      return renderBeauty(palette, variant);
    case 'outdoor':
      return renderOutdoor(palette, name);
    default:
      return renderCar(palette, variant);
  }
};

const createProductSvg = (width: number, height: number, category: string, name: string, variant: number): string => {
  const palette = getPalette(category, name, variant);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 720 720">
      <defs>
        <linearGradient id="productGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.accentSoft}" />
          <stop offset="55%" stop-color="${palette.accent}" />
          <stop offset="100%" stop-color="${palette.accentDark}" />
        </linearGradient>
        <linearGradient id="applianceBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="${palette.accentSoft}" />
        </linearGradient>
      </defs>
      ${renderCatalogBackdrop(palette, variant)}
      ${renderProduct(category, name, variant, palette)}
      ${renderTopBadge(palette, category, name)}
    </svg>
  `.trim();
};

export const generatePlaceholderImage = (
  width: number = 300,
  height: number = 300,
  label: string = 'item',
  seed: string = label,
): string => toSvgDataUri(createProductSvg(width, height, '精选商品', label, hashString(`placeholder-${seed}`) % 4));

export const generateProductImages = (
  productId: string,
  category: string,
  name: string,
  count: number = 4,
): string[] => {
  const variantOffset = hashString(productId) % 4;

  return Array.from({ length: count }, (_, index) =>
    toSvgDataUri(createProductSvg(720, 720, category, name, (variantOffset + index) % 4)),
  );
};

export const getDefaultImage = (
  width: number = 300,
  height: number = 300,
  label: string = 'item',
): string => generatePlaceholderImage(width, height, label, `default-${label}-${width}-${height}`);

export const preloadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
