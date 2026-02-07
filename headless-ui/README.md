# @weikee/headless-ui

A minimal, framework-agnostic Headless UI component library focused on behavior logic and state management.

## Components

### Modal

Accessible modal dialog with:

- Focus trapping (`Tab` / `Shift+Tab` cycle within modal)
- Keyboard navigation (`Escape` to close)
- ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`)
- Body scroll lock with scrollbar compensation
- Backdrop click to close
- Focus restoration to trigger element

## Usage

```typescript
import { createModal } from '@weikee/headless-ui';

const modal = createModal({
  trigger: document.getElementById('open-btn')!,
  content: document.getElementById('modal-panel')!,
  backdrop: document.getElementById('modal-backdrop')!,
  labelledBy: 'modal-title',
  describedBy: 'modal-desc',
  onOpen: () => {
    // Show modal (your CSS logic)
    content.classList.remove('hidden');
    backdrop.classList.remove('hidden');
  },
  onClose: () => {
    // Hide modal (your CSS logic)
    content.classList.add('hidden');
    backdrop.classList.add('hidden');
  },
});

// Open / close programmatically
modal.open();
modal.close();
modal.destroy();
modal.isOpen; // readonly boolean
```

## API

### `createModal(options): ModalInstance`

| Option                 | Type          | Default | Description                        |
| ---------------------- | ------------- | ------- | ---------------------------------- |
| `trigger`              | `HTMLElement`  | —       | Element to restore focus on close  |
| `content`              | `HTMLElement`  | —       | The dialog panel element           |
| `backdrop`             | `HTMLElement?` | —       | Backdrop element (click to close)  |
| `onClose`              | `() => void`  | —       | Called when modal requests close   |
| `onOpen`               | `() => void?`  | —       | Called when modal opens            |
| `closeOnEscape`        | `boolean?`     | `true`  | Close on Escape key                |
| `closeOnBackdropClick` | `boolean?`     | `true`  | Close on backdrop click            |
| `labelledBy`           | `string?`      | —       | ID for `aria-labelledby`           |
| `describedBy`          | `string?`      | —       | ID for `aria-describedby`          |

## Architecture

```
src/
├── index.ts              # Public exports
├── types.ts              # ModalOptions, ModalInstance
└── modal/
    ├── modal.ts          # createModal — core orchestrator
    ├── focus-trap.ts     # Tab cycling within modal
    ├── scroll-lock.ts    # Body scroll lock
    ├── aria.ts           # ARIA attribute management
    └── keyboard.ts       # Escape key handler
```

Each concern is a standalone module — reusable for future components (Dropdown, Tabs, Combobox).

## Development

```bash
npm install
npm run dev        # Vite dev server for demo
npm run build      # Build library (dist/)
npm run build:demo # Build demo (demo-dist/)
npm run typecheck  # TypeScript type checking
```
