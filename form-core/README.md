# @weikee/form-core

A minimal, framework-agnostic form state management core using Proxy-based subscription tracking.

## Features

- **Proxy-based reactivity** — get/set on `form.values` triggers subscriptions automatically
- **Fine-grained subscriptions** — subscribe to individual fields or all changes
- **Object.is equality check** — no duplicate notifications for identical values
- **Reset** — restore all fields to initial values with subscriber notifications
- **Snapshot** — `getValues()` returns a plain object copy

## Usage

```typescript
import { createForm } from '@weikee/form-core';

const form = createForm({
  initialValues: { name: '', email: '' },
});

// Subscribe to a specific field
const unsub = form.subscribe('name', (value, field) => {
  console.log(`${field} changed to: ${value}`);
});

// Subscribe to all changes
form.subscribeAll((value, field) => {
  console.log(`[any] ${field} = ${value}`);
});

// Set values via proxy — triggers subscribers
form.values.name = 'John';   // logs: "name changed to: John"
form.values.email = 'j@x.co'; // logs: "[any] email = j@x.co"

// Read values
console.log(form.values.name); // "John"

// Snapshot (plain object, not proxied)
console.log(form.getValues()); // { name: "John", email: "j@x.co" }

// Reset to initial values
form.reset();

// Unsubscribe
unsub();
```

## API

### `createForm(options): FormInstance`

| Option          | Type     | Description          |
| --------------- | -------- | -------------------- |
| `initialValues` | `object` | Initial field values |

### `FormInstance`

| Property / Method                        | Type                       | Description                          |
| ---------------------------------------- | -------------------------- | ------------------------------------ |
| `values`                                 | `Proxy<V>`                 | Reactive proxy — get/set fields      |
| `subscribe(field, fn)`                   | `(field, fn) => unsub`     | Subscribe to one field               |
| `subscribeAll(fn)`                       | `(fn) => unsub`            | Subscribe to any field change        |
| `reset()`                                | `() => void`               | Reset to initialValues               |
| `getValues()`                            | `() => V`                  | Snapshot of current values           |

## Architecture

```
src/
├── index.ts          # Public exports
├── types.ts          # FormValues, FormOptions, FormInstance, Subscriber
└── form/
    └── form-state.ts # createForm — Proxy + Map<field, Set<Subscriber>>
```

## Development

```bash
npm install
npm run dev        # Vite dev server for demo
npm run build      # Build library (dist/)
npm run build:demo # Build demo (demo-dist/)
npm run typecheck  # TypeScript type checking
```
