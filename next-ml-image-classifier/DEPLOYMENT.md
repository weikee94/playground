# Deployment Guide

## 架构总览

```
Render (FastAPI + MobileNetV2) ← Vercel (Next.js Frontend)
```

| 服务 | 平台 | 用途 |
|------|------|------|
| Backend | Render | FastAPI + ML 推理 |
| Frontend | Vercel | Next.js 前端 |

无数据库，纯推理服务。

---

## 1. Render (FastAPI 后端)

### 创建服务

1. [render.com](https://render.com) → GitHub 登录
2. **New → Web Service → Connect** GitHub repo
3. 设置：
   - **Name**: `next-ml-image-classifier-backend`
   - **Root Directory**: `next-ml-image-classifier/backend`
   - **Runtime**: Docker（自动检测 Dockerfile）
   - **Instance Type**: Free

### 环境变量

不需要任何环境变量。零配置。

### 注意事项

- **首次部署**：Docker 构建需要下载 torch (~800MB)，构建时间 5-10 分钟
- **首次请求**：模型加载到内存需要 ~10 秒
- **冷启动**：免费 tier 闲置 15 分钟休眠，重启后需要重新加载模型（~30 秒）
- **内存**：MobileNetV2 很轻量（~14MB 模型），但 torch 运行时占 ~300MB，Render 免费 512MB 够用

### 验证

```
GET  https://xxx.onrender.com/api/health   → {"status": "ok"}
POST https://xxx.onrender.com/api/classify → 上传图片返回预测结果
```

---

## 2. Vercel (Next.js 前端)

### 创建项目

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. 设置：
   - **Root Directory**: `next-ml-image-classifier/frontend`
   - **Framework Preset**: Next.js

### 环境变量

```
NEXT_PUBLIC_API_URL=https://xxx.onrender.com/api
```

---

## 部署清单

### 顺序

1. Render 部署（无需配置环境变量）
2. 等 Render 构建完成，拿到域名
3. Vercel 部署 + 设 `NEXT_PUBLIC_API_URL`

### 检查项

- [ ] Render 部署成功，`/api/health` 返回 `{"status": "ok"}`
- [ ] Render `/api/classify` 上传图片返回 JSON
- [ ] Vercel `NEXT_PUBLIC_API_URL` 指向 Render 域名
- [ ] 浏览器上传图片测试

---

## vs 其他项目部署对比

| | PHP Todo | Python Todo | ML Classifier |
|--|---|---|---|
| 环境变量 | 6 个 | 1 个 | 0 个 |
| 数据库 | Supabase | Supabase | 无 |
| 构建时间 | ~1 分钟 | ~1 分钟 | ~10 分钟（torch 大） |
| 冷启动 | ~5 秒 | ~5 秒 | ~30 秒（加载模型） |
| 内存占用 | ~50MB | ~30MB | ~300MB |

---

## 备选：HuggingFace Spaces

如果 Render 内存不够，可以用 HuggingFace Spaces（免费，专为 ML 设计）：

1. 去 [huggingface.co/spaces](https://huggingface.co/spaces) → Create new Space
2. 选 **Docker** SDK
3. 上传 `backend/` 目录的文件
4. 自动构建和部署
5. 域名格式：`https://xxx.hf.space`

优势：免费 GPU（如果选 GPU Space），专为 ML 模型优化。
