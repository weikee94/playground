# Deployment Troubleshooting Guide

本项目部署过程中遇到的所有问题及解决方案，供后续参考。

---

## 架构总览

```
Supabase (PostgreSQL) ← Railway (Laravel API) ← Vercel (Next.js Frontend)
```

| 服务 | 平台 | 用途 |
|------|------|------|
| Database | Supabase | PostgreSQL 数据库 |
| Backend | Railway | Laravel PHP API |
| Frontend | Vercel | Next.js 前端 |

---

## 问题 1: composer.lock PHP 版本不兼容

**错误信息：**
```
composer install --optimize-autoloader --no-scripts --no-interaction
Your lock file does not contain a compatible set of packages. Please run composer update.

Problem 1
  - symfony/clock v8.0.0 requires php >=8.4 -> your php version (8.2.30)
```

**原因：** 本地 PHP 8.4 生成的 `composer.lock` 包含需要 PHP 8.4 的依赖（如 symfony/clock v8.0.0），但 Railway 默认 Nixpacks 环境是 PHP 8.2。

**解决方案：** 使用 Dockerfile 指定 PHP 8.4，而不是依赖 Railway 的 Nixpacks 自动检测。

```dockerfile
FROM php:8.4-cli
```

**补充：** 即使在 Railway 的 Build Command 设置了 `composer update`，Nixpacks 仍然会先执行默认的 `composer install`，导致设置无效。Dockerfile 能完全控制构建流程。

---

## 问题 2: Nixpacks 忽略自定义 Build Command

**现象：** 在 Railway Settings 里设了 `composer update --no-dev --optimize-autoloader`，但 deploy log 里还是显示 `composer install`。

**原因：** Railway 用 Nixpacks 自动检测 PHP 项目，它的 install 阶段会先跑默认的 `composer install`，覆盖了用户的 Build Command。

**解决方案：**
- 方案 A（推荐）：添加 `Dockerfile`，完全控制构建
- 方案 B：添加 `nixpacks.toml` 覆盖 install 阶段

```toml
# nixpacks.toml
[phases.install]
cmds = ["composer update --no-dev --optimize-autoloader --no-interaction"]
```

---

## 问题 3: php artisan serve 类型错误

**错误信息：**
```
In ServeCommand.php line 250:
  Unsupported operand types: string + int
```

**原因：** Railway 的 `$PORT` 环境变量是字符串类型，Laravel 的 `ServeCommand` 在 PHP 8.4 严格模式下做 `$port + 1` 算术运算时报类型错误。

**解决方案：** 不用 `php artisan serve`，改用 PHP 内置服务器：

```dockerfile
CMD php -S 0.0.0.0:${PORT:-8080} -t public
```

---

## 问题 4: Railway 自定义 Start Command 覆盖 Dockerfile CMD

**现象：** 更新了 Dockerfile 的 CMD，但 Railway 还是在跑旧的 `php artisan serve`。

**原因：** 之前在 Railway Settings → Deploy 里设了自定义 Start Command，它的优先级高于 Dockerfile 的 CMD。

**解决方案：** 清空 Railway Settings → Deploy → Custom Start Command，让 Dockerfile CMD 生效。

---

## 问题 5: Supabase 数据库连不上 (Network is unreachable)

**错误信息：**
```
SQLSTATE[08006] [7] connection to server at "db.utshhzegveemlrpzanvd.supabase.co",
port 5432 failed: Network is unreachable
```

**原因：** 使用了 Supabase 的 **Direct** 连接地址（`db.xxx.supabase.co:5432`），外部服务器（Railway）无法直接访问。

**解决方案：** 改用 Supabase 的 **Transaction Pooler** 连接：

| | Direct (不能用) | Pooler (要用这个) |
|--|-----------------|-------------------|
| Host | `db.xxx.supabase.co` | `aws-0-[region].pooler.supabase.com` |
| Port | `5432` | `6543` |
| User | `postgres` | `postgres.utshhzegveemlrpzanvd` |

**Pooler URL 格式：**
```
postgresql://postgres.utshhzegveemlrpzanvd:[密码]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**获取方式：** Supabase Dashboard → 点左上角 **Connect** 按钮 → 选 Transaction pooler → 复制 URI。

---

## 问题 6: 500 错误无法看到具体原因

**现象：** 访问 API 返回空白 500 Server Error，不知道具体原因。

**解决方案：** 在 Railway Variables 中临时添加：

```
APP_DEBUG=true
```

这样 Laravel 会返回详细的错误信息（HTML 页面）。**调试完成后记得改回 `false`。**

---

## Railway 完整部署清单

### 1. 项目设置
- [ ] Root Directory: `next-php-todo/backend`
- [ ] 确保有 Dockerfile（Railway 会自动检测并使用）
- [ ] 清空 Custom Start Command（让 Dockerfile CMD 生效）

### 2. Railway Environment Variables
```
APP_KEY=base64:xxxxx       # 本地运行 php artisan key:generate --show
APP_ENV=production
APP_DEBUG=false             # 调试时临时改 true
APP_URL=https://xxx.up.railway.app
DB_CONNECTION=pgsql
DB_URL=postgresql://postgres.xxx:[密码]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 3. Supabase 数据库
```sql
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);
```

### 4. Networking
- [ ] Railway → Settings → Networking → Generate Domain

### 5. Vercel 前端
- [ ] Root Directory: `next-php-todo/frontend`
- [ ] Environment Variable: `NEXT_PUBLIC_API_URL=https://xxx.up.railway.app/api`

---

## Dockerfile 最终版

```dockerfile
FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev unzip git \
    && docker-php-ext-install pdo_pgsql pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY . .
RUN php artisan config:clear

EXPOSE 8080
CMD php -S 0.0.0.0:${PORT:-8080} -t public
```

---

## 排查思路总结

1. **Build 阶段报错** → 检查 PHP 版本、composer.lock 兼容性
2. **Container crash** → 检查 Start Command、APP_KEY 是否设置
3. **500 错误** → 加 `APP_DEBUG=true` 看具体错误
4. **数据库连不上** → 确认用的是 Pooler 连接（6543），不是 Direct（5432）
