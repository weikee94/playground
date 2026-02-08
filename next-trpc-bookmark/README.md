# next-trpc-bookmark

Minimal bookmark manager for learning Next.js App Router + tRPC + Supabase + Zod.

## Tech Stack

- **Next.js 14** — App Router, API routes
- **tRPC v11** — Type-safe API layer
- **Supabase** — PostgreSQL database
- **Zod** — Input validation
- **@tanstack/react-query** — Client-side data fetching (via tRPC)

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then run this SQL in the SQL Editor:

```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  description text default '',
  created_at timestamptz default now()
);
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and service role key (Settings → API in Supabase dashboard).

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
app/
├── layout.tsx              # Root layout + TRPCProvider
├── page.tsx                # Main page (form + list)
└── api/trpc/[trpc]/
    └── route.ts            # tRPC HTTP handler

server/
├── trpc.ts                 # initTRPC, publicProcedure
├── router.ts               # Root appRouter (export type AppRouter)
└── routers/
    └── bookmark.ts         # list / create / delete procedures

lib/
├── supabase.ts             # Supabase server client
├── trpc-client.ts          # createTRPCReact<AppRouter>
└── schemas.ts              # Zod schemas + Bookmark type

components/
├── TRPCProvider.tsx         # QueryClient + tRPC provider
├── BookmarkForm.tsx         # Add bookmark form
└── BookmarkList.tsx         # List + delete
```

## Data Flow

```
Browser → tRPC React hooks → HTTP → API route → tRPC router → Supabase → PostgreSQL
         (type-safe)          (batch)  (fetch handler)  (Zod validated)
```

## Deploy to Vercel

1. Connect repo in Vercel dashboard
2. Set root directory to `next-trpc-bookmark/`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
