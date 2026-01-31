# 🚀 部署指南

## 一键部署到 Vercel (推荐)

### 方式 1: GitHub + Vercel (最简单)

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Tech Playground"
   git remote add origin https://github.com/你的用户名/tech-playground.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

3. **完成!**
   - Vercel 会自动检测 Next.js 项目
   - 自动配置构建设置
   - 分配一个 `.vercel.app` 域名
   - 每次推送代码自动重新部署

### 方式 2: Vercel CLI (适合命令行爱好者)

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 环境变量配置 (可选)

如果你需要环境变量,在 Vercel 项目设置中添加:

- `NEXT_PUBLIC_SITE_URL`: 你的网站 URL
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID (如果需要)

## 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 本地预览生产版本

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 持续集成

每次推送到 GitHub,Vercel 会自动:
- 🏗️ 构建新版本
- ✅ 运行构建检查
- 🚀 部署到预览环境
- 📝 生成预览 URL

推送到 `main` 分支时自动部署到生产环境。

## 性能优化建议

### 1. 启用 Edge Runtime (可选)

在页面文件中添加:
```typescript
export const runtime = 'edge'
```

### 2. 图片优化

使用 Next.js Image 组件:
```tsx
import Image from 'next/image'

<Image src="/path/to/image.jpg" width={500} height={300} alt="描述" />
```

### 3. 字体优化

使用 `next/font`:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

## 故障排查

### 构建失败

**问题**: `Error: Cannot find module 'xxx'`
**解决**: 确保所有依赖都在 `package.json` 中

**问题**: TypeScript 类型错误
**解决**: 运行 `npm run build` 在本地检查

### 部署后页面显示 404

**问题**: 动态路由不工作
**解决**: 检查 `generateStaticParams` 函数是否正确

### 笔记内容不显示

**问题**: `notes` 目录为空
**解决**: 确保笔记文件已提交到 Git

## 监控和分析

Vercel 自动提供:
- 📊 访问量统计
- ⚡ 性能监控(Web Vitals)
- 🚨 错误追踪
- 📈 部署历史

访问项目的 "Analytics" 标签查看详情。

## 成本

- ✅ **Hobby 计划**: 免费
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS
  - 全球 CDN

- 💼 **Pro 计划**: $20/月
  - 1TB 带宽
  - 更多并发构建
  - 团队协作功能

个人博客使用免费计划完全足够!

## 下一步

部署成功后:
1. 添加自定义域名
2. 配置 SEO 元数据
3. 添加 Google Analytics
4. 分享你的博客!

需要帮助? 查看 [Vercel 文档](https://vercel.com/docs) 或 [Next.js 文档](https://nextjs.org/docs)
