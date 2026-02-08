# next-php-todo

Todo app with **PHP (Laravel)** backend + **Next.js** frontend, connected via **OpenAPI** spec as the cross-language type bridge.

## Architecture

```
PHP Controller ──► Scramble auto-generates /docs/api.json
                              │
            npx openapi-typescript ──► frontend/lib/schema.d.ts
                              │
            openapi-fetch reads types ──► type-safe API calls
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, openapi-fetch |
| Backend | Laravel 11, Scramble (OpenAPI) |
| Type Bridge | openapi-typescript (codegen) |
| Database | SQLite (local) / Supabase PostgreSQL (prod) |
| Deploy | Vercel (frontend) + Railway (backend) |

## Database

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);
```

## Local Development

### 1. Start backend

```bash
cd backend
cp .env.example .env      # SQLite by default
php artisan migrate
php artisan serve          # http://localhost:8000
```

### 2. Generate types

```bash
cd frontend
npm install
npm run codegen            # reads from localhost:8000/docs/api.json
```

### 3. Start frontend

```bash
npm run dev                # http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/todos | List all todos |
| POST | /api/todos | Create todo |
| PATCH | /api/todos/{id} | Toggle completed |
| DELETE | /api/todos/{id} | Delete todo |

## OpenAPI Codegen

Whenever the Laravel API changes:

```bash
cd frontend
npm run codegen   # regenerates lib/schema.d.ts
```

TypeScript compiler will flag any breaking changes — that's the value of the OpenAPI type bridge.
