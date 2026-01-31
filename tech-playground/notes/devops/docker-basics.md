---
title: Docker 基础与实战
tags: Docker, 容器化, DevOps
date: 2026-01-29
---

# Docker 基础与实战

Docker 是一个开源的容器化平台,让应用的打包、分发、部署变得简单高效。

## 🎯 核心概念

### 镜像(Image)

镜像是一个只读的模板,包含了运行应用所需的所有内容:
- 代码
- 运行时环境
- 系统工具
- 系统库
- 配置文件

**类比:** 镜像就像一个「类」,定义了容器应该长什么样。

### 容器(Container)

容器是镜像的运行实例,是一个轻量级、隔离的进程。

**类比:** 容器就像一个「对象」,是镜像的具体实例化。

### 仓库(Registry)

存储和分发镜像的地方,最常用的是 Docker Hub。

## 🧪 常用命令

### 镜像操作

```bash
# 拉取镜像
docker pull nginx:latest

# 查看本地镜像
docker images

# 删除镜像
docker rmi nginx:latest

# 构建镜像
docker build -t my-app:1.0 .
```

### 容器操作

```bash
# 运行容器
docker run -d -p 80:80 --name my-nginx nginx

# 查看运行中的容器
docker ps

# 查看所有容器(包括停止的)
docker ps -a

# 停止容器
docker stop my-nginx

# 启动容器
docker start my-nginx

# 删除容器
docker rm my-nginx

# 进入容器
docker exec -it my-nginx /bin/bash

# 查看容器日志
docker logs my-nginx
```

## 💡 Dockerfile 示例

### Node.js 应用

```dockerfile
# 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

### 多阶段构建(优化体积)

```dockerfile
# 第一阶段:构建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段:运行
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## 🔥 最佳实践

### 1. 使用 .dockerignore

避免复制不必要的文件到镜像中:

```
node_modules
.git
.env
*.log
```

### 2. 分层优化

把变化频繁的层放在后面:

```dockerfile
# ✅ 好的做法
COPY package*.json ./  # 依赖不常变
RUN npm install
COPY . .               # 代码经常变

# ❌ 不好的做法
COPY . .               # 代码一变,后面都要重新构建
RUN npm install
```

### 3. 使用非 root 用户

提高安全性:

```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 4. 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 🚀 Docker Compose

管理多容器应用:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

启动:
```bash
docker-compose up -d
```

## 🔍 常见问题

### 1. 容器时区问题

```dockerfile
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
```

### 2. 镜像体积过大

- 使用 alpine 版本(node:18-alpine vs node:18)
- 多阶段构建
- 清理缓存 `RUN npm install && npm cache clean --force`

### 3. 容器日志过多

```bash
# 限制日志大小
docker run --log-opt max-size=10m --log-opt max-file=3 nginx
```

## 🎯 实战场景

### 部署 Next.js 应用到 Vercel

虽然 Vercel 不需要 Docker,但了解 Docker 有助于理解容器化部署:

1. 本地用 Docker 测试生产环境
2. CI/CD 中使用 Docker 构建
3. 备用方案:部署到 VPS

### 微服务架构

- 每个微服务一个容器
- 使用 Docker Compose 本地开发
- 生产环境用 Kubernetes

## 📚 学习路径

1. ✅ **基础**: Docker 安装、镜像、容器
2. 🧪 **进阶**: Dockerfile、网络、卷
3. 💡 **实战**: Docker Compose、多容器应用
4. 🚀 **高级**: Kubernetes、服务编排

## 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
