# JavaScript / TypeScript API

The client-side code is built with TypeScript and runs via the [WordPress Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity/). All interactive behavior lives in the `wp-tosuto` store namespace.

---

## Interactivity API Store

**Namespace:** `wp-tosuto`

Access the store from other blocks or scripts:

```typescript
import { store } from '@wordpress/interactivity';

const { actions } = store( 'wp-tosuto' );
```

State is internal. Use actions to add and remove toasts.

---

## Actions

### `actions.add()`

Add a new toast notification.

```typescript
actions.add( content: string, options?: RawToast ): ToastId
```

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | `string` | yes | — | HTML content displayed in the toast. Sanitized via DOMPurify. |
| `options.id` | `ToastId` | no | auto-generated | Custom ID. Auto-generated when omitted. |
| `options.variant` | `ToastVariant` | no | `'default'` | Visual style. |
| `options.duration` | `number` | no | `5000` | Auto-dismiss delay in ms. Use `0` or negative to disable. |
| `options.dismissable` | `boolean` | no | `true` | Show a dismiss button. |

**Returns** `ToastId` — the ID of the added toast.

**Example**

```typescript
const id = actions.add( '<strong>Saved!</strong>', {
    variant:     'success',
    duration:    3000,
    dismissable: true,
} );
```

---

### `actions.remove()`

Remove a toast immediately.

```typescript
actions.remove( id: ToastId ): void
```

**Example**

```typescript
actions.remove( id );
```

---

### `actions.pauseTimer()`

Pause the auto-dismiss timer for a toast.

```typescript
actions.pauseTimer( id: ToastId ): void
```

Called automatically on `mouseenter`. Can also be called programmatically.

---

### `actions.resumeTimer()`

Resume a paused auto-dismiss timer.

```typescript
actions.resumeTimer( id: ToastId ): void
```

Called automatically on `mouseleave`.

---

## Types

### `ToastId`

```typescript
type ToastId = string;
```

String identifying a toast. Returned by `actions.add()`.

---

### `ToastVariant`

```typescript
type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
```

Controls the visual style of a toast.

---

### `RawToast`

```typescript
type RawToast = Partial<Readonly<{
    id?:          ToastId;
    content:      string;
    variant?:     ToastVariant;
    duration?:    number;
    dismissable?: boolean;
}>>;
```

Input shape for `actions.add()`. All fields optional except `content`.

---

## Server-to-Client Hydration

PHP-queued toasts are passed to JavaScript via `wp_interactivity_state()` in the `wp_footer` hook. The store hydrates automatically on page load — no consumer action required.

```
PHP Queue → Renderer (wp_footer) → wp_interactivity_state()
                                          ↓
                                   store hydration → actions.add() × N
```
