# micro-mvp

手写微前端框架 MVP — 100 行代码实现核心原理。

## 核心功能

| 功能 | 实现方式 |
|------|----------|
| 路由劫持 | `hashchange` + `popstate` 监听 |
| 动态加载 | ES Module `import()` |
| 生命周期 | `mount(container)` / `unmount()` |
| CSS 隔离 | Shadow DOM (`attachShadow`) |
| 状态管理 | `setState` / `getState` / `subscribe` |

## 项目结构

```
micro-mvp/
├── index.html             # 主应用（导航 + 状态栏 + 子应用容器）
├── framework/
│   └── mini-spa.js        # 框架核心（~100 行）
├── main-app/
│   └── app.js             # 注册子应用 + 启动框架
├── sub-app-a/
│   └── app.js             # 子应用 A（计数器 + 修改全局状态）
└── sub-app-b/
    └── app.js             # 子应用 B（输入框 + 定时器 + 读取全局状态）
```

## 验证点

**CSS 隔离：**
- 主应用有 `.button { background: green !important }` 全局样式
- App A 的按钮依然是蓝色 → Shadow DOM 隔离生效

**状态隔离：**
- App A 的计数器、App B 的输入框/定时器 → 各自独立的局部状态
- user / theme → 通过 `MiniSPA.setState/subscribe` 共享的全局状态

**生命周期：**
- 切换路由 → Console 显示 `[MiniSPA] Unmounting...` / `[MiniSPA] Mounting...`
- App B 的定时器在 unmount 时自动清理

## Local Development

```bash
# 任何 HTTP 服务器都可以
npx serve .
# 或
python3 -m http.server 8080
```

## Deploy

纯静态文件，直接部署 Vercel：
- **Framework Preset**: Other
- **Root Directory**: `micro-mvp`
- **Output Directory**: `.`（当前目录）
- 无需 Build Command
