---
title: SCSS 7-1 架构模式
tags: CSS, SCSS, Sass, 前端
date: 2026-02-01
---

# SCSS 7-1 架构模式

7-1 架构是一种流行的 Sass/SCSS 文件组织模式，帮助大型项目保持样式代码的可维护性。

## 什么是 7-1 模式

7-1 模式由 **7 个文件夹** 和 **1 个主文件** 组成。所有的部分文件（partials）都以下划线 `_` 开头，然后在主文件 `main.scss` 中导入。

## 目录结构

```
sass/
├── base/           # 基础样式
├── components/     # 组件样式
├── layout/         # 布局样式
├── pages/          # 页面特定样式
├── themes/         # 主题变体
├── vendors/        # 第三方样式
├── abstracts/      # 变量、混合、函数
└── main.scss       # 主入口文件
```

## 各文件夹职责

### 1. base/
基础样式，包括重置、排版和通用规则。

```scss
// _reset.scss
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

// _typography.scss
body {
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  line-height: 1.7;
}
```

### 2. abstracts/
变量、混合（mixins）和函数，不输出任何 CSS。

```scss
// _variables.scss
$color-primary: #55c57a;
$color-secondary: #7ed56f;
$grid-width: 114rem;

// _mixins.scss
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

@mixin respond($breakpoint) {
  @if $breakpoint == phone {
    @media (max-width: 37.5em) { @content; }
  }
  @if $breakpoint == tablet {
    @media (max-width: 56.25em) { @content; }
  }
}
```

### 3. components/
可复用的独立 UI 组件。

```scss
// _button.scss
.btn {
  &,
  &:link,
  &:visited {
    display: inline-block;
    padding: 1.5rem 4rem;
    border-radius: 10rem;
    transition: all 0.2s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
  }

  &--primary {
    background-color: $color-primary;
    color: #fff;
  }
}
```

### 4. layout/
布局相关样式，如网格、页头、页脚。

```scss
// _grid.scss
.row {
  max-width: $grid-width;
  margin: 0 auto;

  &::after {
    content: "";
    display: table;
    clear: both;
  }

  [class^="col-"] {
    float: left;

    &:not(:last-child) {
      margin-right: $gutter-horizontal;
    }
  }
}

// _header.scss
.header {
  height: 95vh;
  background-size: cover;
  background-position: top;
  position: relative;
}
```

### 5. pages/
页面特定的样式。

```scss
// _home.scss
.section-about {
  background-color: $color-grey-light;
  padding: 25rem 0;
}

// _contact.scss
.contact-form {
  padding: 6rem;
  background-color: rgba(#fff, 0.8);
}
```

### 6. themes/
不同主题的样式变体。

```scss
// _dark.scss
.theme-dark {
  --bg-color: #1a1a1a;
  --text-color: #f5f5f5;
}

// _light.scss
.theme-light {
  --bg-color: #ffffff;
  --text-color: #333333;
}
```

### 7. vendors/
第三方 CSS 或 SCSS 库。

```scss
// _bootstrap.scss
// 导入 Bootstrap 的自定义版本

// _animate.scss
// 动画库样式
```

## 主入口文件

```scss
// main.scss
@import 'abstracts/variables';
@import 'abstracts/mixins';
@import 'abstracts/functions';

@import 'vendors/bootstrap';

@import 'base/reset';
@import 'base/typography';
@import 'base/utilities';

@import 'layout/grid';
@import 'layout/header';
@import 'layout/footer';

@import 'components/button';
@import 'components/card';
@import 'components/form';

@import 'pages/home';
@import 'pages/about';

@import 'themes/dark';
```

## 构建流程

典型的 SCSS 构建流程包括：

```bash
# 1. 编译 SCSS
node-sass sass/main.scss css/style.comp.css

# 2. 添加浏览器前缀
autoprefixer css/style.comp.css -o css/style.prefix.css

# 3. 压缩输出
cssnano css/style.prefix.css css/style.css
```

或使用 npm scripts：

```json
{
  "scripts": {
    "watch:sass": "node-sass sass/main.scss css/style.css -w",
    "build:css": "npm-run-all compile:sass prefix:css compress:css",
    "compile:sass": "node-sass sass/main.scss css/style.comp.css",
    "prefix:css": "autoprefixer css/style.comp.css -o css/style.prefix.css",
    "compress:css": "cssnano css/style.prefix.css css/style.css"
  }
}
```

## 最佳实践

1. **命名规范**: 使用 BEM 命名法（Block__Element--Modifier）
2. **变量优先**: 颜色、字体、间距等都应定义为变量
3. **嵌套限制**: 嵌套层级不超过 3 层
4. **模块化**: 每个组件一个文件，保持单一职责
5. **注释清晰**: 为复杂的混合和函数添加注释

## 下一步

- 学习 CSS Grid 布局
- 探索 PostCSS 生态系统
- 了解 CSS-in-JS 方案
