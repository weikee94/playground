# Design Tokens

Shared design tokens for typography and color palette.

## Installation

```bash
npm install @weikee/design-tokens
```

## Usage

### CSS (Recommended)

Import the full package (variables + base styles):

```css
@import '@weikee/design-tokens';
```

Or import only what you need:

```css
/* Only CSS variables */
@import '@weikee/design-tokens/css/variables';

/* Only base styles (requires variables) */
@import '@weikee/design-tokens/css/base';
```

### JavaScript/TypeScript

```js
import tokens from '@weikee/design-tokens/js';

// Or import specific categories
import { color, fontSize } from '@weikee/design-tokens/js';

console.log(color.primary); // '#4D5382'
console.log(fontSize.base); // '16px'
```

### JSON

```js
import tokens from '@weikee/design-tokens/json';
```

## Tokens

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | 12px | 辅助说明/注释 |
| `--font-size-sm` | 14px | 次要文本/表格 |
| `--font-size-base` | 16px | 正文标准 |
| `--font-size-lg` | 18px | 次级标题 |
| `--font-size-xl` | 20px | 标题 |
| `--font-size-2xl` | 24px | 大标题 |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | 400 | 正文 |
| `--font-weight-medium` | 500 | 强调/表头 |
| `--font-weight-semibold` | 600 | 标题 |
| `--font-weight-bold` | 700 | Hero/关键数字 |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | 1.25 | 标题 |
| `--line-height-normal` | 1.6 | 正文 |
| `--line-height-relaxed` | 1.75 | 中文密集内容 |

### Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--color-cream` | #FAF9F5 | Cream White (lightest) |
| `--color-beige` | #F0EEE6 | Beige |
| `--color-primary` | #4D5382 | Deep Blue Purple |
| `--color-muted` | #8A7968 | Brown Taupe |
| `--color-accent` | #A8763E | Golden Brown |

## License

MIT
