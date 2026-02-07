# @weikee/query-core

Minimal TanStack Query-inspired async state manager with cache timestamps.

## Features

- **State machine** — `idle` → `loading` → `success` / `error`, clean transitions
- **Cache with staleTime** — skip fetch if data is still fresh
- **Fetch deduplication** — concurrent `.fetch()` calls return the same promise
- **Subscriptions** — subscribe to state changes, immediate callback with current state

## Usage

```typescript
import { Query } from '@weikee/query-core';

const query = new Query({
  queryFn: () => fetch('/api/users').then((r) => r.json()),
  staleTime: 5000, // 5s cache
});

// Subscribe to state changes
const unsub = query.subscribe((state) => {
  console.log(state.status); // 'idle' | 'loading' | 'success' | 'error'
  console.log(state.data);   // TData | undefined
  console.log(state.error);  // TError | undefined
  console.log(state.isFresh); // boolean
});

// Fetch — transitions: idle → loading → success/error
await query.fetch();

// Fetch again — skipped if within staleTime (cache hit)
await query.fetch();

// Snapshot
query.getState(); // { status, data, error, dataUpdatedAt, isFresh }

unsub();
```

## API

### `new Query(options)`

| Option      | Type                  | Default | Description                          |
| ----------- | --------------------- | ------- | ------------------------------------ |
| `queryFn`   | `() => Promise<TData>` | —       | Async function that fetches data     |
| `staleTime` | `number?`              | `0`     | Ms that data is considered fresh     |

### `Query` instance

| Method / Property  | Type                                 | Description                              |
| ------------------ | ------------------------------------ | ---------------------------------------- |
| `fetch()`          | `Promise<TData>`                     | Fetch data (skips if fresh, deduplicates) |
| `subscribe(fn)`    | `(fn) => unsub`                      | Subscribe to state transitions            |
| `getState()`       | `QueryState<TData, TError>`          | Snapshot of current state                |

### `QueryState`

| Field           | Type                  | Description                       |
| --------------- | --------------------- | --------------------------------- |
| `status`        | `QueryStatus`         | `'idle' \| 'loading' \| 'success' \| 'error'` |
| `data`          | `TData \| undefined`   | Fetched data                      |
| `error`         | `TError \| undefined`  | Fetch error                       |
| `dataUpdatedAt` | `number \| undefined`  | Timestamp of last successful fetch |
| `isFresh`       | `boolean`             | Whether data is within staleTime  |

## Architecture

```
src/
├── index.ts          # Public exports
├── types.ts          # QueryStatus, QueryState, QueryOptions
└── query/
    └── query.ts      # Query class — state machine + fetch + cache
```

## Development

```bash
npm install
npm run dev        # Vite dev server for demo
npm run build      # Build library (dist/)
npm run build:demo # Build demo (demo-dist/)
npm run typecheck  # TypeScript type checking
```
