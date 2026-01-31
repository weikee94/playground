# ⚡ 快速启动指南

## 1. 本地运行 (1 分钟)

```bash
# 进入项目目录
cd tech-playground

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 2. 添加你的第一条笔记 (2 分钟)

### 创建笔记文件

在 `notes/frontend/` 目录下创建 `my-first-note.md`:

```markdown
---
title: 我的第一条笔记
tags: React, 学习笔记
date: 2026-01-31
---

# 我的第一条笔记

这是我的第一条技术笔记!

## 今天学到了什么

- React Hooks 的基本使用
- useState 和 useEffect 的区别
- 如何优化组件性能

## 代码示例

```javascript
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  )
}
```

## 总结

React Hooks 让函数组件也能拥有状态,代码更简洁!
```

### 刷新浏览器

笔记会自动出现在首页!

## 3. 部署到 Vercel (3 分钟)

### 选项 A: GitHub + Vercel (推荐)

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub (先在 GitHub 创建仓库)
git remote add origin https://github.com/你的用户名/tech-playground.git
git push -u origin main
```

然后访问 [vercel.com](https://vercel.com):
1. 登录 Vercel
2. Import Repository
3. 选择你的仓库
4. 点击 Deploy

**完成!** 你的博客已经上线了!

### 选项 B: Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 4. 自定义你的博客 (可选)

### 修改标题和描述

编辑 `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: '你的博客名称',
  description: '你的博客描述',
}
```

### 修改导航栏

编辑 `app/layout.tsx` 中的导航部分:

```tsx
<a href="/" style={{...}}>
  🚀 你的博客名称
</a>
```

### 添加更多分类

在 `notes/` 目录下创建新文件夹:

```bash
mkdir notes/backend
mkdir notes/database
mkdir notes/algorithms
```

### 修改主题色

编辑 `app/globals.css`,修改渐变背景:

```css
body {
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}
```

## 5. 下一步

- 📝 添加更多笔记
- 🎨 自定义样式和布局
- 🚀 部署到自定义域名
- 📊 查看 Vercel Analytics 了解访问情况
- 💡 参考 [README.md](README.md) 了解更多功能

## 常见问题

### Q: 笔记没有显示?

A: 确保:
1. 笔记文件在 `notes/分类/` 目录下
2. 文件扩展名是 `.md`
3. 文件包含正确的 frontmatter

### Q: 构建失败?

A: 检查:
1. Node.js 版本 >= 18
2. 运行 `npm install` 安装所有依赖
3. 运行 `npm run build` 在本地测试

### Q: 如何添加图片?

A: 把图片放在 `public/` 目录,然后在笔记中引用:

```markdown
![图片描述](/image.jpg)
```

### Q: 如何修改样式?

A: 现在使用的是内联样式,你可以:
1. 修改 `app/globals.css` (全局样式)
2. 修改各个页面组件的内联样式
3. 未来可以升级到 Tailwind CSS

## 需要帮助?

- 📖 阅读完整的 [README.md](README.md)
- 🚀 查看 [DEPLOY.md](DEPLOY.md) 了解部署细节
- 💡 参考现有的示例笔记

开始享受你的技术游乐场吧! 🎮
