---
sidebar_position: 1
---

# PHP API

## Functions

These global functions are available in any PHP context after the plugin boots.

---

### `wp_tosuto()`

Add a toast notification to the render queue.

```php
function wp_tosuto( string $content, array $options = [] ): string
```

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `$content` | `string` | yes | — | HTML displayed inside the toast. Sanitized via `wp_kses_post()`. |
| `$options['variant']` | `string` | no | `'default'` | Visual style. One of: `default`, `success`, `error`, `warning`, `info`. |
| `$options['duration']` | `int` | no | `5000` | Auto-dismiss delay in milliseconds. |
| `$options['dismissable']` | `bool` | no | `true` | Whether a dismiss button is shown. |

**Returns** `string` — UUID of the queued toast. Pass to `wp_tosuto_remove()` to cancel it.

**Example**

```php
$id = wp_tosuto( '<strong>Saved!</strong>', [
    'variant'     => 'success',
    'duration'    => 3000,
    'dismissable' => true,
] );
```

---

### `wp_tosuto_remove()`

Remove a previously queued toast before it is rendered.

```php
function wp_tosuto_remove( string $id ): bool
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `$id` | `string` | UUID returned by `wp_tosuto()`. |

**Returns** `bool` — `true` if the toast was found and removed, `false` otherwise.

**Example**

```php
$id = wp_tosuto( 'Processing…' );

if ( $error ) {
    wp_tosuto_remove( $id );
    wp_tosuto( 'Something went wrong.', [ 'variant' => 'error' ] );
}
```

---

## Hooks & Filters

### Hook: `wp-tosuto.api.render-empty`

**Type:** filter (`apply_filters`)

Controls whether an empty toast container is rendered when no toasts are queued. An empty container allows client-side `actions.add()` calls to work on pages where the server queued no toasts.

```php
apply_filters( 'wp-tosuto.api.render-empty', true );
```

**Accepted return values**

| Value | Behaviour |
|-------|-----------|
| `true` | Render the empty container (default). |
| `false` | Render nothing. |
| `callable` | Called with no arguments; return value is used as the boolean. Accepts any WordPress template tag string (e.g. `'is_singular'`). |
| other | Coerced to `bool`. |

**Examples**

```php
// Only render on singular pages
add_filter( 'wp-tosuto.api.render-empty', 'is_singular' );

// Custom condition
add_filter( 'wp-tosuto.api.render-empty', function (): bool {
    return is_user_logged_in();
} );

// Disable entirely
add_filter( 'wp-tosuto.api.render-empty', '__return_false' );
```
