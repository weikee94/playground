# Deployment Guide

## 架构总览

```
Supabase (PostgreSQL) ← Render (FastAPI) ← Vercel (Next.js Frontend)
```

| 服务 | 平台 | 用途 |
|------|------|------|
| Database | Supabase | PostgreSQL 数据库 |
| Backend | Render | FastAPI Python API |
| Frontend | Vercel | Next.js 前端 |

---

## 1. Supabase (数据库)

在 SQL Editor 执行：

```sql
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);
```

获取 Pooler 连接字符串：
- Dashboard → 点左上角 **Connect** → 选 **Transaction pooler** → 复制 URI
- 格式：`postgresql://postgres.xxx:[密码]@aws-0-[region].pooler.supabase.com:6543/postgres`

> **重要**：必须用 Pooler 地址（端口 6543），不能用 Direct 地址（端口 5432）。外部服务连不上 Direct。

---

## 2. Render (FastAPI 后端)

### 创建服务

1. [render.com](https://render.com) → GitHub 登录
2. **New → Web Service → Connect** GitHub repo
3. 设置：
   - **Name**: `next-python-todo-backend`
   - **Root Directory**: `next-python-todo/backend`
   - **Runtime**: Docker（自动检测 Dockerfile）
   - **Instance Type**: Free

### 环境变量

```
DATABASE_URL=postgresql://postgres.xxx:[密码]@aws-0-[region].pooler.supabase.com:6543/postgres
```

只需要这一个变量，不需要 APP_KEY 之类的。

### 部署完成

- Render 会给一个域名：`https://xxx.onrender.com`
- 验证：访问 `https://xxx.onrender.com/api/todos` 应返回 `[]`
- Swagger UI：`https://xxx.onrender.com/api/docs`

### 注意事项

- 免费 tier 闲置 15 分钟后休眠，下次请求冷启动 ~30 秒
- 之后请求正常响应

---

## 3. Vercel (Next.js 前端)

### 创建项目

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. 设置：
   - **Root Directory**: `next-python-todo/frontend`
   - **Framework Preset**: Next.js

### 环境变量

```
NEXT_PUBLIC_API_URL=https://xxx.onrender.com/api
```

（替换成你 Render 的实际域名）

---

## 部署清单

### 顺序

1. Supabase SQL 建表
2. Render 部署 + 设 `DATABASE_URL`
3. 拿到 Render 域名
4. Vercel 部署 + 设 `NEXT_PUBLIC_API_URL`

### 检查项

- [ ] Supabase todos 表已创建
- [ ] Render `DATABASE_URL` 用的是 Pooler 地址（6543）
- [ ] Render 部署成功，`/api/todos` 返回 JSON
- [ ] Vercel `NEXT_PUBLIC_API_URL` 指向 Render 域名
- [ ] 浏览器测试 CRUD

---

## vs next-php-todo 部署对比

| | PHP (Laravel + Railway) | Python (FastAPI + Render) |
|--|---|---|
| 环境变量 | 6 个（APP_KEY, APP_ENV, APP_DEBUG...） | 1 个（DATABASE_URL） |
| 构建问题 | PHP 版本不兼容、Nixpacks 覆盖、类型错误 | 无，Dockerfile 直接跑 |
| 调试 | 需要 APP_DEBUG=true | FastAPI 默认返回详细错误 |
| 总结 | 踩了 6 个坑 | 基本一次成功 |
