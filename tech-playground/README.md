# 🎮 技术游乐场 | Tech Playground

一个有趣的技术笔记博客,让技术学习变得好玩!

## ✨ 特性

- 📝 **简单的笔记管理**: Markdown 格式,易于编辑
- 🏷️ **标签分类**: 支持多标签,方便查找
- 🎨 **精美界面**: 渐变背景,卡片式布局
- 🚀 **快速部署**: 一键部署到 Vercel
- 🔍 **实验标记**: 用 emoji 标记笔记状态(🧪实验中 ✅已验证 💡灵感 🔥踩坑 🚀最佳实践)

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 添加笔记

在 `notes` 目录下创建 Markdown 文件:

```
notes/
├── frontend/        # 前端相关笔记
│   ├── flexbox-layout.md
│   └── micro-frontend-intro.md
└── devops/         # DevOps 相关笔记
    └── docker-basics.md
```

### 笔记格式

每个笔记文件使用 frontmatter 定义元数据:

```markdown
---
title: 我的笔记标题
tags: React, TypeScript, 前端
date: 2026-01-31
---

# 笔记内容

这里是笔记正文...
```

## 📦 部署到 Vercel

### 方法 1: GitHub 一键部署

1. 把项目推送到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. Import Repository
4. 点击 Deploy

### 方法 2: 命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 🎯 后续升级计划

### 第一阶段(当前)
- ✅ 基础笔记展示
- ✅ 分类和标签
- ✅ 响应式设计

### 第二阶段(计划中)
- [ ] 搜索功能
- [ ] 代码高亮优化
- [ ] 随机笔记功能
- [ ] 深色模式

### 第三阶段(未来)
- [ ] 交互式代码编辑器(Sandpack)
- [ ] 技术树可视化
- [ ] AI 问答助手
- [ ] 知识图谱

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **部署**: Vercel
- **样式**: CSS-in-JS (内联样式,未来可升级到 Tailwind CSS)

## 📚 目录结构

```
tech-playground/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页(笔记列表)
│   ├── globals.css        # 全局样式
│   └── notes/
│       └── [category]/
│           └── [slug]/
│               └── page.tsx  # 笔记详情页
├── notes/                 # 笔记内容(Markdown)
│   ├── frontend/
│   └── devops/
├── components/            # React 组件(未来扩展)
├── public/               # 静态资源
├── next.config.js        # Next.js 配置
├── tsconfig.json         # TypeScript 配置
└── package.json
```

## 💡 使用建议

1. **笔记分类**: 根据技术领域创建不同的目录(frontend, backend, devops 等)
2. **标签使用**: 添加多个标签,方便关联查找
3. **实验标记**: 在标题或内容中使用 emoji 标记笔记状态
4. **定期更新**: 学到新东西马上记录,保持知识库的活跃

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可

MIT License
