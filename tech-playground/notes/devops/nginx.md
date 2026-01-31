---
title: Nginx 架构与最佳实践笔记
tags: Nginx, DevOps, 反向代理, 负载均衡
date: 2026-02-01
---

# Nginx 架构与最佳实践笔记

本文总结了 Nginx 配置的核心知识点，包括 Worker 调优、location 匹配、限流、反向代理等最佳实践。

## 项目 Nginx 架构总览

### 架构复杂度与成熟度评价

- **教学向配置**：每个配置文件聚焦单一知识点，便于学习和实验
- **生产参考价值**：worker 配置、upstream 配置、限流配置等均可作为生产配置的起点
- **覆盖面完整**：从静态资源服务到反向代理到安全限流，形成完整知识体系

## Nginx 最佳实践详解

### 实践 1：Worker 进程的精细化调优

#### 实践名称

「通过 worker 配置最大化利用服务器硬件资源」

#### 设计动机

- Nginx 是多进程架构，worker 进程数量和资源限制直接影响并发处理能力
- 不合理的配置会导致 CPU 利用率低、文件描述符耗尽、进程被系统 OOM Kill

#### 项目中的实际做法

```nginx
# 4.5/nginx.conf - 完整的 worker 配置示例
user  nginx;
worker_processes  auto;                    # 自动匹配 CPU 核心数
worker_cpu_affinity 0001 0010 0100 1000;   # CPU 亲和性绑定（4核）
worker_priority -10;                        # 提高进程优先级
worker_rlimit_nofile 12500;                # 单进程最大文件描述符
worker_rlimit_core 50M;                    # core dump 文件大小限制
working_directory /opt/nginx/tmp;          # core dump 存放目录
worker_shutdown_timeout 5s;                # 优雅退出超时时间
timer_resolution 100ms;                    # 时间精度（减少 gettimeofday 调用）
```

#### 示例配置

✅ **推荐写法**（生产环境）：

```nginx
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;
worker_shutdown_timeout 10s;
```

❌ **不推荐写法**：

```nginx
worker_processes 1;         # 浪费多核 CPU
worker_rlimit_nofile 1024;  # 默认值太小，高并发下会报错
```

### 实践 2：Events 块的连接优化

#### 实践名称

「通过 events 配置提升连接处理效率」

#### 设计动机

- `worker_connections` 决定单进程最大并发连接数
- `accept_mutex` 可避免惊群效应（多 worker 争抢连接）
- `multi_accept` 可让 worker 一次性接受多个连接

#### 项目中的实际做法

```nginx
events {
    worker_connections  17500;
    accept_mutex on;
    accept_mutex_delay 100ms;
    multi_accept on;
}
```

#### 示例配置

✅ **推荐写法**：

```nginx
events {
    use epoll;                    # Linux 下使用 epoll
    worker_connections 10240;
    multi_accept on;
    accept_mutex off;             # 1.11.3+ 默认 off，高并发场景建议关闭
}
```

> **公式**：最大并发 = worker_processes × worker_connections

### 实践 3：server_name 的匹配优先级控制

#### 实践名称

「理解 server_name 四种匹配模式的优先级」

#### 设计动机

- 多虚拟主机场景下，server_name 匹配顺序直接影响请求路由
- 错误的优先级理解会导致请求被路由到错误的 server 块

#### 项目中的实际做法（4.5/nginx.conf）

```nginx
# 精确匹配 - 最高优先级
server {
    server_name www.nginx-test.com;
    root html/nginx-test/all-match;
}

# 左侧通配符 - 第二优先级
server {
    server_name *.nginx-test.com;
    root html/nginx-test/left-match;
}

# 右侧通配符 - 第三优先级
server {
    server_name www.nginx-test.*;
    root html/nginx-test/right-match;
}

# 正则匹配 - 最低优先级
server {
    server_name ~^sport\.nginx-test\..*$;
    root html/nginx-test/regular-match;
}
```

#### 优先级规则

| 优先级 | 类型 | 示例 |
|--------|------|------|
| 1 | 精确匹配 | `server_name www.example.com;` |
| 2 | 左侧通配 | `server_name *.example.com;` |
| 3 | 右侧通配 | `server_name www.example.*;` |
| 4 | 正则匹配 | `server_name ~^www\d+\.example\.com$;` |
| 5 | default_server | 兜底 |

### 实践 4：location 匹配规则的正确使用

#### 实践名称

「掌握 location 五种匹配修饰符的优先级」

#### 设计动机

- location 是 Nginx 路由的核心，匹配规则错误会导致 404 或路由混乱
- 正则匹配有性能开销，合理使用 `^~` 可提前终止匹配

#### 项目中的实际做法（4.7/nginx.conf）

```nginx
# 精确匹配 - 最高优先级
location = /match_all/ {
    root html;
}

# 前缀匹配 + 停止正则 - 第二优先级
location ^~ /bbs/ {
    root html;
}

# 正则匹配
location ~ \.(jpeg|jpg)$ {
    root html/images;
}

# 普通前缀匹配 - 最低优先级
location /test/ {
    index no_sign.html;
}
```

#### 优先级规则

| 优先级 | 修饰符 | 说明 |
|--------|--------|------|
| 1 | `=` | 精确匹配，匹配后立即停止 |
| 2 | `^~` | 前缀匹配，匹配后不检查正则 |
| 3 | `~` | 区分大小写的正则匹配 |
| 4 | `~*` | 不区分大小写的正则匹配 |
| 5 | `/` | 普通前缀匹配（最长优先） |

✅ **最佳实践**：

```nginx
# 静态资源用 ^~ 避免正则匹配开销
location ^~ /static/ {
    root /var/www;
}

# API 路由用普通前缀
location /api/ {
    proxy_pass http://backend;
}

# 文件后缀用正则
location ~* \.(js|css|png|jpg)$ {
    expires 30d;
}
```

### 实践 5：root 与 alias 的正确选择

#### 实践名称

「理解 root 和 alias 路径拼接的本质区别」

#### 设计动机

| 指令 | 路径计算方式 |
|------|-------------|
| `root` | 实际路径 = root + location |
| `alias` | 实际路径 = alias（location 被替换） |

混淆会导致 404 或访问到错误文件。

#### 项目中的实际做法（4.6/nginx.conf）

```nginx
# 使用 root：访问 /picture/1.jpg → /opt/nginx/html/picture/1.jpg
location /picture {
    root /opt/nginx/html;
}

# 使用 alias：访问 /bbs/1.jpg → /opt/nginx/html/bbs/1.jpg
location /bbs {
    alias /opt/nginx/html/bbs/;  # 注意结尾的 /
}
```

#### 示例配置

✅ **推荐写法**：

```nginx
# location 与目录名一致时用 root
location /images/ {
    root /var/www;  # → /var/www/images/xxx
}

# location 与实际目录不一致时用 alias
location /download/ {
    alias /data/files/;  # → /data/files/xxx
}
```

❌ **常见错误**：

```nginx
# alias 结尾漏掉 /
location /bbs/ {
    alias /opt/nginx/html/bbs;  # 错！会变成 /opt/nginx/html/bbsxxx
}
```

### 实践 6：连接数限流与请求限流

#### 实践名称

「通过 limit_conn 和 limit_req 实现精细化限流」

#### 设计动机

- 防止恶意请求耗尽服务器资源
- 保护后端服务不被过载
- 区分连接数限制（limit_conn）和请求速率限制（limit_req）

#### 项目中的实际做法

```nginx
# 5.2/nginx.conf - 连接数限制
http {
    limit_conn_zone $binary_remote_addr zone=limit_addr:10m;

    server {
        location / {
            limit_conn_status 503;
            limit_conn_log_level warn;
            limit_conn limit_addr 2;    # 单 IP 最多 2 个并发连接
            limit_rate 50;              # 单连接限速 50 bytes/s
        }
    }
}

# 5.3/nginx.conf - 请求速率限制
http {
    limit_req_zone $binary_remote_addr zone=limit_req:15m rate=12r/m;

    server {
        location / {
            limit_req_status 504;
            limit_req_log_level notice;
            limit_req zone=limit_req;
            # limit_req zone=limit_req burst=7 nodelay;  # 允许突发
        }
    }
}
```

#### 示例配置

✅ **生产环境推荐**：

```nginx
http {
    # 基于 IP 的请求限流（100 请求/秒）
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

    server {
        location /api/ {
            limit_req zone=api_limit burst=50 nodelay;
            limit_req_status 429;  # 返回标准的 Too Many Requests
        }
    }
}
```

### 实践 7：IP 访问控制

#### 实践名称

「通过 allow/deny 实现 IP 白名单控制」

#### 设计动机

- 限制内部接口只能从特定网段访问
- 实现简单的防火墙功能
- 规则按顺序匹配，第一条匹配即生效

#### 项目中的实际做法（5.4/nginx.conf）

```nginx
location / {
    allow 192.168.184.0/24;  # 允许内网网段
    deny all;                 # 拒绝其他所有
}
```

#### 示例配置

✅ **推荐写法**：

```nginx
# 内部监控接口 - 只允许内网访问
location /metrics {
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    allow 192.168.0.0/16;
    deny all;
    stub_status;
}
```

### 实践 8：HTTP Basic 认证

#### 实践名称

「通过 auth_basic 实现简单的密码保护」

#### 设计动机

- 快速为内部管理页面添加访问保护
- 不需要额外的认证服务
- **注意**：明文传输，生产环境必须配合 HTTPS

#### 项目中的实际做法（5.5/nginx.conf）

```nginx
location /bbs/ {
    auth_basic "test user pass";
    auth_basic_user_file /opt/nginx/auth/encrypt_pass;
    root html;
}
```

#### 示例配置

✅ **生成密码文件**：

```bash
# 使用 htpasswd 生成（需要安装 httpd-tools）
htpasswd -c /etc/nginx/auth/.htpasswd admin
```

✅ **配置示例**：

```nginx
location /admin/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/auth/.htpasswd;
}
```

### 实践 9：Rewrite 重写规则

#### 实践名称

「理解 rewrite 的四种 flag 行为差异」

#### 设计动机

| Flag | 行为 |
|------|------|
| `last` | 重写后重新匹配 location |
| `break` | 重写后停止在当前 location 执行 |
| `redirect` | 302 临时重定向 |
| `permanent` | 301 永久重定向 |

#### 项目中的实际做法（5.8/nginx.conf、5.9/nginx.conf）

```nginx
server {
    server_name write.kutian.edu;
    root html;

    # permanent - 301 跳转到外部 URL
    location /search {
        rewrite /(.*) http://www.cctv.com permanent;
    }

    # last - 重写后重新匹配 location
    location /images {
        rewrite /images/(.*) /pics/$1 last;
    }

    # break - 重写后直接在当前 location 处理
    location /pics {
        rewrite /pics/(.*) /photos/$1 break;
        return 200 "return 200 in /pics";  # break 后这行不执行
    }

    location /photos {
        return 200 "return 200 in /photos";
    }
}
```

#### 示例配置

✅ **常用场景**：

```nginx
# 强制 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

# URL 美化（隐藏 .php）
location / {
    try_files $uri $uri/ /index.php?$args;
}

# 旧 URL 重定向
rewrite ^/old-page$ /new-page permanent;
```

### 实践 10：Upstream 负载均衡配置

#### 实践名称

「通过 upstream 实现高可用后端集群」

#### 设计动机

- 将请求分发到多个后端服务器
- 实现故障转移和健康检查
- 通过 keepalive 复用连接提升性能

#### 项目中的实际做法（6.7/proxy.conf、6.8/proxy.conf）

```nginx
upstream back_end {
    server 192.168.184.20:8080 weight=2 max_conns=1000 fail_timeout=10s max_fails=3;
    keepalive 32;              # 保持 32 个长连接
    keepalive_requests 80;     # 单连接最大请求数
    keepalive_timeout 20s;     # 长连接超时时间
}

server {
    location /proxy/ {
        proxy_pass http://back_end/proxy;
    }
}
```

#### 示例配置

✅ **生产环境推荐**：

```nginx
upstream backend {
    least_conn;  # 最少连接数算法

    server 10.0.0.1:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 weight=2 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:8080 backup;  # 备用节点

    keepalive 64;
    keepalive_timeout 60s;
}

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";  # 启用 keepalive 必须
    }
}
```

### 实践 11：proxy_pass URL 结尾斜杠的处理

#### 实践名称

「理解 proxy_pass URL 结尾斜杠对路径的影响」

#### 设计动机

- 这是 Nginx 代理**最常见的坑**
- 结尾有无 `/` 会导致完全不同的路径转发行为

#### 项目中的实际做法（6.8/记录.txt）

```nginx
# 不带 / - location 路径透传
location /proxy/ {
    proxy_pass http://127.0.0.1:8008;
}
# 请求 /proxy/abc/test.html → 上游收到 /proxy/abc/test.html

# 带 / - location 路径被替换
location /proxy/ {
    proxy_pass http://127.0.0.1:8080/;
}
# 请求 /proxy/abc/test.html → 上游收到 /abc/test.html
```

#### 规则总结

| 配置 | 请求 | 上游收到 |
|------|------|---------|
| `proxy_pass http://backend;` | `/api/users` | `/api/users` |
| `proxy_pass http://backend/;` | `/api/users` | `/users` |
| `proxy_pass http://backend/v2/;` | `/api/users` | `/v2/users` |

### 实践 12：请求体大小和缓冲控制

#### 实践名称

「通过 client_body 配置控制请求体处理行为」

#### 设计动机

- 防止超大请求体耗尽内存或磁盘
- 控制请求体是否写入临时文件
- 优化上传场景的性能

#### 项目中的实际做法（6.9/receive_request_body.conf）

```nginx
location /receive/ {
    proxy_pass http://test_server;
    client_max_body_size 250k;          # 最大请求体大小
    client_body_buffer_size 100k;       # 内存缓冲大小
    client_body_temp_path test_body_path;  # 临时文件目录
    client_body_in_file_only on;        # 强制写入文件
    client_body_in_single_buffer on;    # 尽量放入连续内存
}
```

#### 示例配置

✅ **文件上传场景**：

```nginx
location /upload/ {
    client_max_body_size 100m;           # 允许上传 100MB
    client_body_buffer_size 1m;          # 1MB 以下放内存
    client_body_temp_path /tmp/nginx_upload;
    proxy_pass http://upload_backend;
}
```

✅ **API 场景**（默认即可）：

```nginx
location /api/ {
    client_max_body_size 1m;             # API 请求通常较小
    proxy_pass http://api_backend;
}
```

### 实践 13：Nginx 变量的调试输出

#### 实践名称

「通过 return 200 输出变量值进行调试」

#### 设计动机

- 快速验证变量值是否符合预期
- 调试 rewrite 规则和条件判断
- 理解请求的完整上下文

#### 项目中的实际做法（5.13/var_tcp.conf、5.14-5.15/var_request.conf）

```nginx
# TCP 连接相关变量
location / {
    return 200 "remote_addr:    $remote_addr
remote_port:    $remote_port
server_addr:    $server_addr
server_port:    $server_port
server_protocol:$server_protocol
connection:     $connection
";
}

# HTTP 请求相关变量
location / {
    return 200 "uri:            $uri
request_uri:    $request_uri
scheme:         $scheme
request_method: $request_method
args:           $args
host:           $host
";
}
```

#### 调试技巧

```nginx
# 添加响应头输出变量值
add_header X-Debug-Uri $uri;
add_header X-Debug-Request-Id $request_id;

# 临时调试 location
location /debug {
    return 200 "Request: $request\nHost: $host\nURI: $uri\n";
}
```

### 实践 14：stub_status 监控端点

#### 实践名称

「通过 stub_status 暴露 Nginx 运行指标」

#### 设计动机

- 获取连接数、请求数等核心指标
- 配合 Prometheus/Grafana 实现监控
- 生产环境必须限制访问来源

#### 项目中的实际做法（4.10/nginx.conf）

```nginx
location /monitor_status {
    stub_status;
}
```

#### 示例配置

✅ **生产环境推荐**：

```nginx
location /nginx_status {
    stub_status;
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
}
```

### 实践 15：autoindex 目录浏览

#### 实践名称

「通过 autoindex 实现文件下载服务」

#### 设计动机

- 快速搭建文件下载服务
- 内部镜像站或资源分发

#### 项目中的实际做法（5.11/autoindex.conf）

```nginx
location /download/ {
    root /opt/source;
    autoindex on;
    autoindex_exact_size off;    # 显示人类可读的文件大小
    autoindex_format html;       # HTML 格式输出
    autoindex_localtime off;     # 使用 GMT 时间
}
```

## 关键配置模式

### Pattern 1: Static Assets Pattern（静态资源模式）

```nginx
location ^~ /static/ {
    root /var/www;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location ~* \.(js|css|png|jpg|gif|ico|woff2?)$ {
    root /var/www/static;
    expires 1y;
}
```

### Pattern 2: API Proxy Pattern（API 代理模式）

```nginx
upstream api_backend {
    server 10.0.0.1:8080;
    keepalive 32;
}

location /api/ {
    proxy_pass http://api_backend/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Connection "";
}
```

### Pattern 3: Rate Limiting Pattern（限流模式）

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_conn conn 10;
        }
    }
}
```

### Pattern 4: Security Headers Pattern（安全头模式）

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 可迁移的通用工程经验

- **worker_processes auto** 是绝大多数场景的最佳选择，无需手动指定
- **worker_rlimit_nofile** 必须调大，默认 1024 在生产环境远远不够
- **server_name 优先级**：精确 > 左通配 > 右通配 > 正则 > default_server
- **location 优先级**：= > ^~ > ~ / ~* > 普通前缀（最长优先）
- **proxy_pass 结尾斜杠**是最常见的配置错误来源，务必理解其路径替换规则
- **limit_req + burst + nodelay** 组合可实现平滑限流而非直接拒绝
- **upstream keepalive** 配合 `proxy_http_version 1.1` 和 `Connection ""` 才能生效
- **stub_status** 端点必须做 IP 访问控制，否则会暴露服务器状态
- **client_max_body_size** 默认 1m，文件上传场景必须调大
- 调试时善用 `return 200` 输出变量值，比看日志更直观

## 个人读书笔记式总结

### 我从这套 Nginx 配置中学到的东西

#### 1. location 匹配是有"成本"的

- 正则匹配 `~` 每次请求都要执行，性能不如前缀匹配
- `^~` 存在的意义就是"我已经确定是这个 location 了，不要再试正则"

#### 2. proxy_pass 的斜杠问题终于理解了

- 没有斜杠 = 透传原始 URI
- 有斜杠 = 替换掉 location 匹配的部分
- 这不是 bug，是 feature，只是文档没讲清楚

#### 3. limit_req 的 burst 参数很精妙

- 没有 burst：超过速率直接 503
- 有 burst 无 nodelay：超过速率的请求排队等待
- 有 burst 有 nodelay：突发请求立即处理，但占用 burst 配额

#### 4. upstream keepalive 不是配了就生效

- 必须设置 `proxy_http_version 1.1`
- 必须设置 `proxy_set_header Connection ""`
- 否则每个请求还是新建连接

#### 5. Nginx 变量的分类思路

| 层级 | 变量 |
|------|------|
| TCP 层 | remote_addr, remote_port, server_addr |
| HTTP 请求层 | uri, request_uri, args, host |
| Nginx 处理层 | request_time, request_id, document_root |
| 响应层 | status, body_bytes_sent |

#### 6. rewrite 的 last vs break

- `last`：跳出当前 location，重新匹配（相当于 goto）
- `break`：停在当前 location（相当于 return）
- 不理解这个区别会写出死循环
