# next-python-todo

Todo app with **Python (FastAPI)** backend + **Next.js** frontend, connected via **OpenAPI** spec as the cross-language type bridge.

## Architecture

```
FastAPI (Pydantic models) ──► 内置自动生成 /openapi.json
                                     │
               npx openapi-typescript ──► frontend/lib/schema.d.ts
                                     │
               openapi-fetch reads types ──► type-safe API calls
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, openapi-fetch |
| Backend | FastAPI, Pydantic, uvicorn |
| Type Bridge | openapi-typescript (codegen) |
| Database | SQLite (local) / Supabase PostgreSQL (prod) |
| Deploy | Vercel (frontend) + Render (backend) |

## vs next-php-todo

| | PHP (Laravel) | Python (FastAPI) |
|--|---------------|------------------|
| OpenAPI 生成 | 需要 Scramble 插件 | 内置，零配置 |
| 验证 | `$request->validate()` | Pydantic models |
| Swagger UI | 需要 Scramble 提供 | 内置 `/docs` |
| 代码量 | Controller + Model + Migration | 单文件 `main.py` |

## Local Development

### 1. Start backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000   # http://localhost:8000
```

Swagger UI: http://localhost:8000/api/docs

### 2. Generate types

```bash
cd frontend
npm install
npm run codegen   # reads from localhost:8000/api/openapi.json
```

### 3. Start frontend

```bash
npm run dev       # http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/todos | List all todos |
| POST | /api/todos | Create todo |
| PATCH | /api/todos/{id} | Toggle completed |
| DELETE | /api/todos/{id} | Delete todo |

## OpenAPI Codegen

Whenever the FastAPI routes change:

```bash
cd frontend
npm run codegen   # regenerates lib/schema.d.ts
```

## Deploy

- **Backend → Render**: Connect GitHub, set root to `next-python-todo/backend`, add `DATABASE_URL` env var
- **Frontend → Vercel**: Connect GitHub, set root to `next-python-todo/frontend`, add `NEXT_PUBLIC_API_URL` env var
