const fs = require('fs');
const path = require('path');

const tokens = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.6,
    relaxed: 1.75,
  },
  fontFamily: {
    base: 'Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  color: {
    cream: '#FAF9F5',
    beige: '#F0EEE6',
    primary: '#4D5382',
    muted: '#8A7968',
    accent: '#A8763E',
  },
};

const distDir = path.join(__dirname, '..', 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write JSON
fs.writeFileSync(
  path.join(distDir, 'tokens.json'),
  JSON.stringify(tokens, null, 2)
);

// Write JS module
const jsContent = `// Auto-generated design tokens
export const tokens = ${JSON.stringify(tokens, null, 2)};

export const fontSize = tokens.fontSize;
export const fontWeight = tokens.fontWeight;
export const lineHeight = tokens.lineHeight;
export const fontFamily = tokens.fontFamily;
export const color = tokens.color;

export default tokens;
`;

fs.writeFileSync(path.join(distDir, 'tokens.js'), jsContent);

// Write TypeScript definitions
const dtsContent = `// Auto-generated TypeScript definitions
export interface Tokens {
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  fontFamily: {
    base: string;
  };
  color: {
    cream: string;
    beige: string;
    primary: string;
    muted: string;
    accent: string;
  };
}

export declare const tokens: Tokens;
export declare const fontSize: Tokens['fontSize'];
export declare const fontWeight: Tokens['fontWeight'];
export declare const lineHeight: Tokens['lineHeight'];
export declare const fontFamily: Tokens['fontFamily'];
export declare const color: Tokens['color'];

export default tokens;
`;

fs.writeFileSync(path.join(distDir, 'tokens.d.ts'), dtsContent);

console.log('Build complete!');
