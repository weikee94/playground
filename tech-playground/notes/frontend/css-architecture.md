---
title: CSS 架构读书笔记
tags: CSS, SCSS, ITCSS, BEM, 前端架构
date: 2026-02-01
---

# CSS 架构读书笔记

本文总结了 ITCSS + BEM + AMCSS 混合架构的最佳实践，涵盖分层目录结构、主题切换、响应式设计等核心内容。

## 项目 CSS 架构总览

### 架构风格

**ITCSS + BEM + AMCSS 混合架构**

| 方法论 | 用途 | 本项目实现 |
|--------|------|-----------|
| ITCSS | 分层组织 | `settings/` → `tools/` → `base/` → `object/` → `theme/` |
| BEM | 组件命名 | `@include b/e/m` Mixin 封装 |
| AMCSS | 原子工具类 | `[mt10]` `[ph20]` 属性选择器 |

### 为什么这种架构适合该项目

| 项目特点 | 架构解决方案 |
|---------|-------------|
| 移动端电商，组件复用率高 | BEM 保证组件样式隔离 |
| 需要快速调整间距/颜色 | AMCSS 属性选择器提供灵活性 |
| 多主题需求（default/cool/warm） | 分层架构便于主题切换 |
| 团队协作 | Mixin 封装降低 BEM 书写成本 |

## CSS 架构最佳实践清单

### ITCSS 分层目录结构

#### 设计动机（Why）

- 解决大型项目中样式特异性冲突问题
- 让样式从「最通用」逐渐过渡到「最具体」
- 新人加入时能快速定位代码位置

#### 项目目录结构

```
src/style/
├── settings/          # 层1: 变量定义（无实际CSS输出）
│   └── var.scss       # 颜色、边框等 Design Tokens
│
├── tools/             # 层2: 函数与 Mixin（无实际CSS输出）
│   ├── functions/     # 纯函数（z-index、颜色混合等）
│   │   ├── _z-index.scss
│   │   ├── _convert.scss
│   │   └── ...
│   └── mixins/        # 40+ 可复用 Mixin
│       ├── _BEM.scss
│       ├── _box-center.scss
│       ├── _position.scss
│       └── ...
│
├── base/              # 层3: 元素基础样式
│   ├── page.scss      # html 样式
│   ├── link.scss      # a 标签
│   ├── form.scss      # 表单元素
│   └── fonts/         # 字体文件
│
├── object/            # 层4: 无装饰的布局工具类
│   ├── white-space.scss   # margin/padding 工具
│   ├── background.scss    # 背景色工具
│   ├── font-color.scss    # 文字颜色工具
│   └── ellipsis.scss      # 文本截断工具
│
├── theme/             # 层5: 主题配置
│   ├── index.scss
│   ├── theme-default.scss
│   ├── theme-cool.scss
│   └── theme-warm.scss
│
├── gobal.scss         # 全局注入文件（settings + tools + theme）
└── index.scss         # 入口文件（base + object）
```

#### 代码示例

**✅ 推荐：gobal.scss 作为自动注入层**

```javascript
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/style/gobal.scss";`
      }
    }
  }
}
```

```scss
// gobal.scss - 只导入不输出CSS的层
@import "./settings/var.scss";

// Import Functions
@import "./tools/functions/_z-index.scss";
@import "./tools/functions/_convert.scss";
// ...

// Import Mixins
@import "./tools/mixins/_BEM.scss";
@import "./tools/mixins/_box-center.scss";
// ...

@import "./theme";
```

```scss
// index.scss - 导入实际输出CSS的层
@import "base/page.scss";
@import "base/link.scss";
@import "object/white-space.scss";
@import "object/background.scss";
// ...
```

**❌ 不推荐：在组件中直接 import 变量文件**

```scss
// 每个组件都要写一遍，且可能遗漏
<style lang="scss">
@import "@/style/settings/var.scss";
.my-component { ... }
</style>
```

### BEM Mixin 封装

#### 设计动机（Why）

- 原生 BEM 类名冗长（`.block__element--modifier`）
- 手写易出错，且嵌套关系不直观
- Mixin 封装后，**嵌套结构即语义结构**

#### 核心 Mixin 定义

```scss
// tools/mixins/_BEM.scss

$elementSeparator: '__';
$modifierSeparator: '--';

// Block
@mixin b($block) {
  .#{$block} {
    @content;
  }
}

// Element
@mixin e($element) {
  $selector: &;
  @if containsModifier($selector) {
    $block: getBlock($selector);
    @at-root {
      #{$selector} {
        #{$block+$elementSeparator+$element} {
          @content;
        }
      }
    }
  } @else {
    @at-root {
      #{$selector+$elementSeparator+$element} {
        @content;
      }
    }
  }
}

// Modifier
@mixin m($modifier) {
  @at-root {
    #{&}#{$modifierSeparator+$modifier} {
      @content;
    }
  }
}
```

#### 代码示例

**✅ 推荐：使用 BEM Mixin**

```scss
// 输入 SCSS
@include b(c-layout) {
  display: flex;
  flex-direction: column;

  @include e(header) {
    height: 100px;
  }

  @include m(horizontal) {
    flex-direction: row;
  }
}

// 输出 CSS
.c-layout {
  display: flex;
  flex-direction: column;
}
.c-layout__header {
  height: 100px;
}
.c-layout--horizontal {
  flex-direction: row;
}
```

**✅ Vue 组件中实际使用**

```vue
<!-- layout.vue -->
<template>
  <section class="c-layout" :class="{'c-layout--horizontal': horizontal}">
    <slot></slot>
  </section>
</template>

<style lang="scss" scoped>
@include b(c-layout) {
  display: flex;
  flex-direction: column;

  @include m(horizontal) {
    flex-direction: row;
  }
}
</style>
```

**❌ 不推荐：手写 BEM**

```scss
// 嵌套关系不直观，易写错分隔符
.c-layout { ... }
.c-layout--horizontal { ... }
.c-layout__header { ... }
.c-layout__header--active { ... }
```

### AMCSS 属性选择器工具类

#### 设计动机（Why）

- 需要快速调整间距、颜色等原子属性
- 不想为每个小调整创建新类名
- 属性选择器语义更清晰：`<div mt10>` vs `<div class="mt-10">`

#### 工具类生成原理

```scss
// object/white-space.scss

$direction: (l left, r right, t top, b bottom);

@for $i from 1 through 30 {
  @each $type in m, p, v, h, a {

    // margin: [ml1] ~ [ml30], [mr1] ~ [mr30], ...
    @if $type == m {
      @each $d in $direction {
        [m#{nth($d, 1)}#{$i}] {
          margin-#{nth($d, 2)}: #{$i}px;
        }
      }
    }

    // padding: [pl1] ~ [pl30], [pr1] ~ [pr30], ...
    @else if $type == p {
      @each $d in $direction {
        [p#{nth($d, 1)}#{$i}] {
          padding-#{nth($d, 2)}: #{$i}px;
        }
      }
    }

    // horizontal: [ph1] ~ [ph30], [mh1] ~ [mh30]
    @else if $type == h {
      [ph#{$i}] {
        padding-left: #{$i}px;
        padding-right: #{$i}px;
      }
      [mh#{$i}] {
        margin-left: #{$i}px;
        margin-right: #{$i}px;
      }
    }

    // vertical: [pv1] ~ [pv30]
    @else if $type == v {
      [pv#{$i}] {
        padding-top: #{$i}px;
        padding-bottom: #{$i}px;
      }
    }

    // all: [pa1] ~ [pa30]
    @else {
      [pa#{$i}] {
        padding: #{$i}px;
      }
    }
  }
}
```

#### 属性命名规则速查表

| 前缀 | 含义 | 示例 | 输出 |
|-----|------|-----|------|
| `m` | margin | `ml10` | `margin-left: 10px` |
| `p` | padding | `pr20` | `padding-right: 20px` |
| `v` | vertical | `pv15` | `padding-top: 15px; padding-bottom: 15px` |
| `h` | horizontal | `mh10` | `margin-left: 10px; margin-right: 10px` |
| `a` | all | `pa20` | `padding: 20px` |

| 后缀 | 含义 |
|-----|------|
| `l` | left |
| `r` | right |
| `t` | top |
| `b` | bottom |

#### 代码示例

**✅ 推荐：模板中使用属性工具类**

```html
<c-search mt15 mb15 mr20 radius4></c-search>

<c-avatar pv10></c-avatar>

<div class="good__box" pv24 ph12>
  <p class="good__des" mb10>{{ item.des }}</p>
</div>
```

**✅ AMCSS Mixin 创建自定义模块**

```scss
// 定义
@include am(button) {
  padding: 10px 20px;
  border-radius: 4px;
}

@include am(button, primary) {
  background: $color-primary;
  color: white;
}

@include am(button, large) {
  font-size: 18px;
  padding: 15px 30px;
}

// 输出 CSS
[am-button] { padding: 10px 20px; border-radius: 4px; }
[am-button~="primary"] { background: #FF5777; color: white; }
[am-button~="large"] { font-size: 18px; padding: 15px 30px; }

// 使用
<div am-button="primary large">Submit</div>
```

### Design Tokens 集中管理

#### 设计动机（Why）

- 颜色、间距等设计规范需要全局一致
- 修改主题色时只需改一处
- 变量命名体现**语义**而非具体值

#### 完整变量定义

```scss
// settings/var.scss

/* ========================
   Color
   ======================== */
$color-primary: #FF5777;
$color-white: #FFFFFF;
$color-black: #000000;

/* Text Colors - 按语义命名 */
$color-text-primary: #333333;      // 主要文字
$color-text-secondary: #666666;    // 次要文字
$color-text-tertiary: $color-white;        // 第三级（白色，用于深色背景）
$color-text-quaternary: $color-primary;    // 第四级（主题色）

/* Background Colors */
$background-color-primary: #F1F1F1;            // 页面背景
$background-color-secondary: $color-white;     // 卡片背景
$background-color-tertiary: $color-primary;    // 强调背景

/* ========================
   Border
   ======================== */
$border-color-base: #E5E5E5;
$border-width-base: 1Px !default;    // 大写 Px 避免 px2rem 转换
$border-style-base: solid !default;
$border-base: $border-width-base $border-style-base $border-color-base !default;
```

#### 代码示例

**✅ 推荐：使用语义化变量**

```scss
// base/page.scss
html {
  background-color: $background-color-primary;
  color: $color-text-primary;
}

// 组件中
.c-button {
  color: $color-text-tertiary;  // 语义：第三级文字色（白色）
  background: $background-color-tertiary;  // 语义：强调背景（主题色）
}

.card {
  background: $background-color-secondary;  // 语义：卡片背景（白色）
  border: $border-base;
}
```

**❌ 不推荐：硬编码颜色值**

```scss
html {
  background-color: #F1F1F1;  // 魔法数字，不知道代表什么
  color: #333;
}

.c-button {
  color: white;  // 改主题时要全局搜索替换
  background: #FF5777;
}
```

### 主题切换系统

#### 设计动机（Why）

- 电商 App 经常需要节日/活动主题
- 运行时切换主题，无需重新构建
- 主题配置与组件样式解耦

#### 主题定义

```scss
// theme/theme-default.scss
$theme-default: (
  t-color-primary: (
    color: #FF5777
  ),
  t-shadow: (
    shadow: 0 0 8px #FF5777
  ),
  t-border: (
    border: 1Px solid #FF5777
  )
);

// theme/theme-cool.scss
$theme-cool: (
  t-color-primary: (
    color: #4A90D9
  ),
  t-shadow: (
    shadow: 0 0 8px #4A90D9
  ),
  t-border: (
    border: 1Px solid #4A90D9
  )
);

// theme/theme-warm.scss
$theme-warm: (
  t-color-primary: (
    color: #FF9500
  ),
  t-shadow: (
    shadow: 0 0 8px #FF9500
  ),
  t-border: (
    border: 1Px solid #FF9500
  )
);
```

#### 主题系统核心实现

```scss
// theme/index.scss

@import "./theme-default.scss";
@import "./theme-cool.scss";
@import "./theme-warm.scss";

// 主题 Map
$themes: (
  default: $theme-default,
  cool: $theme-cool,
  warm: $theme-warm
);

// 核心 Mixin：遍历所有主题生成选择器
@mixin themable {
  @each $section, $map in $themes {
    $map: $map !global;  // 设置全局变量供 themed() 使用
    [data-theme="#{$section}"] & {
      @content;
    }
  }
}

// 获取主题值的函数
@function themed($key, $color) {
  @return map-get(map-get($map, $key), $color);
}

// 便捷 Mixin
@mixin t-color-primary($style) {
  @include themable {
    #{$style}: themed('t-color-primary', 'color');
  }
}

@mixin t-shadow {
  @include themable {
    box-shadow: themed('t-shadow', 'shadow');
  }
}

@mixin t-border {
  @include themable {
    border: themed('t-border', 'border');
  }
}
```

#### 代码示例

**✅ 在组件中使用主题 Mixin**

```scss
@include b(search) {
  @include t-shadow;  // 自动生成三套主题的 box-shadow
}

@include b(button) {
  @include t-color-primary(background-color);
  @include t-border;
}

// 输出 CSS:
// [data-theme="default"] .search { box-shadow: 0 0 8px #FF5777; }
// [data-theme="cool"] .search { box-shadow: 0 0 8px #4A90D9; }
// [data-theme="warm"] .search { box-shadow: 0 0 8px #FF9500; }
```

**✅ HTML/JS 中切换主题**

```html
<!-- 设置主题属性 -->
<div id="app" data-theme="default">
  ...
</div>
```

```javascript
// Vue 中切换主题
const changeTheme = (themeName) => {
  document.getElementById('app').dataset.theme = themeName;
}

// 示例
changeTheme('cool');   // 切换到冷色主题
changeTheme('warm');   // 切换到暖色主题
```

### 响应式设计：px2rem 自动转换

#### 设计动机（Why）

- 移动端需要适配不同屏幕尺寸
- 开发时用 px 更直观（设计稿是 750px）
- 运行时转 rem，配合 lib-flexible 实现弹性布局

#### 配置详解

```javascript
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-plugin-px2rem')({
            rootValue: 75,              // 750设计稿 / 10 = 75
            exclude: /(node_module)/,   // 排除 node_modules
            minPixelValue: 3,           // 小于 3px 不转换
            selectorBlackList: ['van']  // Vant 组件不转换（有自己的适配）
          })
        ]
      }
    }
  }
}
```

#### 转换规则

| 输入 | 输出 | 说明 |
|-----|------|-----|
| `width: 750px` | `width: 10rem` | 750 / 75 = 10 |
| `font-size: 28px` | `font-size: 0.373rem` | 28 / 75 ≈ 0.373 |
| `border: 1Px solid #ccc` | `border: 1Px solid #ccc` | 大写 Px 不转换 |
| `padding: 2px` | `padding: 2px` | 小于 3px 不转换 |

#### 代码示例

**✅ 开发时直接写 px**

```scss
.search {
  width: 530px;   // 编译后: 7.0667rem
  height: 60px;   // 编译后: 0.8rem
  font-size: 28px; // 编译后: 0.373rem
}
```

**✅ 不想转换时用大写 Px**

```scss
.border {
  border: 1Px solid #ccc;  // 保持 1px 不变，避免在高清屏上变粗
}

.hairline {
  height: 1Px;  // 细线保持 1px
}
```

**✅ main.js 引入 lib-flexible**

```javascript
// main.js
import 'lib-flexible';  // 自动设置 html 的 font-size
```

### 常用布局 Mixin

#### Mixin 速查表

| Mixin | 用途 | 参数 |
|-------|------|------|
| `box-center` | Flex 居中 | `$justify`, `$align` |
| `center-translate` | Transform 居中 | `$direction` |
| `position` | 定位简写 | `$position`, `$args` |
| `box-clamp` | 多行文本截断 | `$lines`, `$substract` |
| `dimensions` | 宽高设置 | `$width`, `$height` |

#### box-center - Flex 居中

```scss
// 定义
@mixin box-center($justify: center, $align: center) {
  display: flex;
  @if($align != false) {
    align-items: $align;
  }
  @if($justify != false) {
    justify-content: $justify;
  }
}

// 使用
.container {
  @include box-center;  // 水平垂直居中
}

.row {
  @include box-center(space-between, center);  // 两端对齐，垂直居中
}

.col {
  @include box-center(false, flex-start);  // 只设置垂直方向
}
```

#### center-translate - Transform 居中

```scss
// 定义
@mixin center-translate($direction: both) {
  position: absolute;
  @if $direction == both {
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
  @else if $direction == horizontal {
    left: 50%;
    transform: translate3d(-50%, 0, 0);
  }
  @else if $direction == vertical {
    top: 50%;
    transform: translate3d(0, -50%, 0);
  }
}

// 使用
.modal {
  @include center-translate;  // 完全居中
}

.tooltip {
  @include center-translate(horizontal);  // 只水平居中
}
```

#### position - 定位简写

```scss
// 定义
@mixin position($position, $args) {
  @each $o in top right bottom left {
    $i: index($args, $o);
    @if $i and $i + 1 <= length($args) and type-of(nth($args, $i + 1)) == number {
      #{$o}: nth($args, $i + 1);
    }
  }
  position: $position;
}

// 使用
.overlay {
  @include position(fixed, top 0 right 0 bottom 0 left 0);
}

.tooltip {
  @include position(absolute, top 10px right 20px);
}

// 输出
.overlay {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: fixed;
}
```

#### box-clamp - 多行文本截断

```scss
// 定义
@mixin box-clamp($lines: 1, $substract: 0) {
  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100% - $substract;
    overflow: hidden;
  } @else {
    overflow: hidden;
    display: -webkit-box;
    display: box;
    -webkit-line-clamp: $lines;
    line-clamp: $lines;
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }
}

// 使用
.title {
  @include box-clamp;  // 单行截断
}

.description {
  @include box-clamp(2);  // 两行截断
}

.summary {
  @include box-clamp(3);  // 三行截断
}
```

### Z-index 集中管理

#### 设计动机（Why）

- z-index 魔法数字难以维护
- 层级关系应该在一处定义
- 支持嵌套层级（modal > overlay > content）

#### 实现方式

```scss
// 1. 定义层级 Map（在 var.scss 中）
$z-layers: (
  modal: (
    base: 1000,
    overlay: 1010,
    content: 1020,
    close: 1030
  ),
  dropdown: 500,
  tooltip: 600,
  header: 100,
  footer: 100
);

// 2. 辅助函数（在 _z-index.scss 中）
@function map-has-nested-keys($map, $keys...) {
  @each $key in $keys {
    @if not map-has-key($map, $key) {
      @return false;
    }
    $map: map-get($map, $key);
  }
  @return true;
}

@function map-deep-get($map, $keys...) {
  @each $key in $keys {
    $map: map-get($map, $key);
  }
  @return $map;
}

// 3. 核心函数
@function z($layers...) {
  @if not map-has-nested-keys($z-layers, $layers...) {
    @warn "No layer found for `#{inspect($layers...)}` in $z-layers map.";
  }
  @return map-deep-get($z-layers, $layers...);
}
```

#### 代码示例

**✅ 推荐：使用 z() 函数**

```scss
.modal-overlay {
  z-index: z(modal, overlay);  // 输出: 1010
}

.modal-content {
  z-index: z(modal, content);  // 输出: 1020
}

.modal-close {
  z-index: z(modal, close);    // 输出: 1030
}

.dropdown {
  z-index: z(dropdown);        // 输出: 500
}

.header {
  z-index: z(header);          // 输出: 100
}
```

**❌ 不推荐：魔法数字**

```scss
.modal-overlay {
  z-index: 9999;  // 谁知道这个数字代表什么？
}

.dropdown {
  z-index: 1000;  // 会不会和其他元素冲突？
}
```

## 可迁移的通用原则

### 架构层面

| 原则 | 说明 |
|-----|------|
| **分层优于扁平** | Settings → Tools → Base → Objects → Components 的分层结构适用于任何中大型项目 |
| **全局样式自动注入** | `prependData` 配置让每个组件自动获得变量和 Mixin，无需手动 import |
| **主题用数据属性** | `[data-theme="dark"]` 支持运行时切换，无需重新构建 |

### 变量管理

| 原则 | 说明 |
|-----|------|
| **变量语义化** | `$color-text-primary` 优于 `$gray-333`，修改主题时不需要改变量名 |
| **z-index 用 Map + 函数** | 层级关系一目了然，避免 z-index 军备竞赛 |

### 工具类

| 原则 | 说明 |
|-----|------|
| **Mixin 封装 BEM** | 降低 BEM 书写成本，让嵌套结构即语义结构 |
| **属性选择器做工具类** | `[mt10]` 比 `.mt-10` 更简洁，且不会与业务类名冲突 |

### 响应式

| 原则 | 说明 |
|-----|------|
| **大写 Px 规避转换** | 需要保持 1px 时用 `1Px`，PostCSS 只处理小写 px |
| **第三方组件加黑名单** | Vant 等组件库有自己的适配方案，不应重复转换 |

## 个人学习总结

### 核心收获

#### 1. ITCSS 的「倒三角」思想很实用

特异性从低到高排列，Settings/Tools 层不输出任何 CSS，只提供变量和函数。这样即使全部导入也不会产生冗余代码。

#### 2. BEM Mixin 是最佳实践

之前觉得 BEM 类名太长，现在发现用 `@include b/e/m` 完美解决。嵌套写法让 Block-Element-Modifier 关系一目了然。

```scss
// 这种写法，结构即文档
@include b(card) {
  @include e(header) { ... }
  @include e(body) { ... }
  @include m(highlighted) { ... }
}
```

#### 3. AMCSS 属性选择器是隐藏宝石

`<div mt10 ph20>` 比 `class="mt-10 ph-20"` 简洁太多。且属性选择器特异性低，不会覆盖组件样式。

#### 4. 主题系统的精妙之处

用 `[data-theme="xxx"] &` 生成多套选择器，运行时只需改根节点属性。比 CSS 变量方案更兼容老浏览器。

#### 5. px 到 rem 的转换策略

| 场景 | 做法 |
|-----|------|
| 常规尺寸 | 直接写 px，自动转 rem |
| 1px 边框 | 大写 Px，保持不变 |
| 第三方组件 | 加黑名单，不转换 |
| 小于 3px | 自动保持 px |

### 关键洞察

> **样式架构的本质是「关注点分离」**

| 层 | 关注点 |
|---|-------|
| Settings | 设计决策（颜色、间距数值） |
| Tools | 实现能力（Mixin、函数） |
| Base | 浏览器重置（元素默认样式） |
| Objects | 布局原语（间距、对齐） |
| Components | 业务样式（具体组件） |
| Theme | 可切换的皮肤 |

### 可复用的资产

这个项目的 `src/style/tools/` 目录是最有价值的部分，包含 40+ 个 Mixin，可以直接复制到新项目使用：

- `_BEM.scss` - BEM 命名封装
- `_box-center.scss` - 居中方案
- `_box-clamp.scss` - 文本截断
- `_position.scss` - 定位简写
- `_media-queries.scss` - 响应式断点
- `_animation.scss` - 动画生成器
- `_z-index.scss` - 层级管理

## 附录：项目文件速查

| 文件 | 用途 |
|-----|------|
| `src/style/settings/var.scss` | Design Tokens 定义 |
| `src/style/tools/mixins/_BEM.scss` | BEM Mixin |
| `src/style/tools/mixins/_box-center.scss` | 居中 Mixin |
| `src/style/tools/mixins/_box-clamp.scss` | 文本截断 Mixin |
| `src/style/tools/mixins/_position.scss` | 定位 Mixin |
| `src/style/tools/functions/_z-index.scss` | z-index 函数 |
| `src/style/object/white-space.scss` | 间距工具类生成 |
| `src/style/theme/index.scss` | 主题系统核心 |
| `vue.config.js` | px2rem 配置 |
