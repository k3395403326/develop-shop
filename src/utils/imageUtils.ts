const palettes = [
  { background: '#fff4ec', accent: '#e1251b', highlight: '#ffd4c7' },
  { background: '#eef6ff', accent: '#1f6feb', highlight: '#cfe5ff' },
  { background: '#eefaf4', accent: '#15803d', highlight: '#c9f2d8' },
  { background: '#fff8e8', accent: '#b45309', highlight: '#fde3a7' },
  { background: '#f6f1ff', accent: '#7c3aed', highlight: '#ddd0ff' },
];

const hashString = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return Math.abs(hash);
};

const pickPalette = (seed: string) => palettes[hashString(seed) % palettes.length];

const toSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const createImageSvg = (width: number, height: number, seed: string): string => {
  const palette = pickPalette(seed);
  const hash = hashString(seed);
  const badgeNumber = (hash % 90) + 10;
  const circleX = 64 + (hash % Math.max(width - 128, 1));
  const circleY = 72 + (Math.floor(hash / 7) % Math.max(height - 144, 1));

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.background}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="28" fill="url(#bg)" />
      <circle cx="${circleX}" cy="${circleY}" r="88" fill="${palette.highlight}" opacity="0.7" />
      <circle cx="${width - 90}" cy="${height - 84}" r="72" fill="${palette.highlight}" opacity="0.55" />
      <rect x="34" y="34" width="${width - 68}" height="${height - 68}" rx="24" fill="white" fill-opacity="0.75" />
      <rect x="58" y="64" width="${width - 116}" height="${Math.max(height - 178, 120)}" rx="20" fill="${palette.accent}" fill-opacity="0.08" />
      <rect x="84" y="98" width="${width - 168}" height="24" rx="12" fill="${palette.accent}" fill-opacity="0.9" />
      <rect x="84" y="138" width="${Math.max(width - 224, 120)}" height="16" rx="8" fill="#1f2937" fill-opacity="0.78" />
      <rect x="84" y="170" width="${Math.max(width - 268, 90)}" height="16" rx="8" fill="#475569" fill-opacity="0.45" />
      <rect x="84" y="${height - 142}" width="116" height="40" rx="20" fill="${palette.accent}" />
      <text x="142" y="${height - 116}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="700">
        ITEM
      </text>
      <text x="${width - 92}" y="${height - 104}" text-anchor="middle" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="56" font-weight="700">
        ${badgeNumber}
      </text>
    </svg>
  `.trim();
};

export const generatePlaceholderImage = (
  width: number = 300,
  height: number = 300,
  _label: string = 'item',
  seed: string = _label,
): string => toSvgDataUri(createImageSvg(width, height, seed));

export const generateProductImages = (
  productId: string,
  category: string,
  name: string,
  count: number = 4,
): string[] =>
  Array.from({ length: count }, (_, index) =>
    generatePlaceholderImage(640, 640, name, `${category}-${productId}-${index}`),
  );

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
