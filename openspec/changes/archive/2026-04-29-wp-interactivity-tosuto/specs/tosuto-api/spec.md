## ADDED Requirements

### Requirement: PHP wp_tosuto function

The plugin SHALL provide a global `wp_tosuto(string $content, array $options = [])` function that queues a toast notification for display on the current page. The `$options` array SHALL support `variant` (string), `duration` (int, milliseconds), and `dismissable` (bool) keys. At call time, the function SHALL generate a unique `id` (via `wp_generate_uuid4()`), apply defaults for any omitted option (`variant: 'default'`, `duration: 5000`, `dismissable: true`), store the fully-formed toast in the request-scoped queue, and return the `id` to the caller. Defaults are NOT re-applied later — the entry is final from the moment `wp_tosuto()` returns.

#### Scenario: Queuing a toast from PHP

- **WHEN** `wp_tosuto('Settings saved', ['variant' => 'success'])` is called during a PHP request
- **THEN** the toast is queued and displayed on the rendered page after Interactivity API hydration

#### Scenario: Multiple PHP toasts are displayed

- **WHEN** `wp_tosuto('First')` and `wp_tosuto('Second')` are called during a PHP request
- **THEN** both toasts appear on the page in the order they were queued

### Requirement: wp_tosuto sanitizes content before queuing

`wp_tosuto()` SHALL sanitize the `$content` string before storing the toast in the request-scoped queue. Sanitization SHALL remove executable HTML (script elements, inline event-handler attributes, `javascript:` URLs, and equivalent XSS vectors) while preserving safe formatting allowed in standard WordPress post content. The sanitized string SHALL be what is handed to `wp_interactivity_state()` so that, once hydrated, every entry in `state.toasts` is already safe regardless of whether it originated from PHP or from a JS `actions.add` call.

#### Scenario: Script tags are stripped from PHP-queued toasts

- **WHEN** `wp_tosuto('Saved <script>alert(1)</script>')` is called during a PHP request
- **THEN** the queued toast's `content` has the `<script>` element removed, and the matching entry in `state.toasts` after hydration contains no script element

#### Scenario: Safe formatting is preserved in PHP-queued toasts

- **WHEN** `wp_tosuto('<strong>Saved</strong> successfully')` is called during a PHP request
- **THEN** the queued toast's `content` still contains the `<strong>` element wrapping the text "Saved"

### Requirement: wp_tosuto returns a removal handle

`wp_tosuto()` SHALL return the unique `id` it assigned to the queued toast, mirroring the JS `actions.add()` return value. This `id` is the handle third-party server-side code uses to remove the toast before it ships to the client (see `wp_tosuto_remove`).

#### Scenario: Caller receives an id from wp_tosuto

- **WHEN** `$id = wp_tosuto('Settings saved', ['variant' => 'success'])` is called during a PHP request
- **THEN** `$id` is a non-empty string uniquely identifying the queued toast, and the same `id` appears on the matching toast in `state.toasts` after hydration

### Requirement: PHP wp_tosuto_remove function

The plugin SHALL provide a global `wp_tosuto_remove(string $id): bool` function that removes a previously queued toast from the request-scoped queue, provided it has not yet been flushed to the Interactivity API state. The function SHALL return `true` if a matching toast was found and removed, and `false` otherwise. This allows third-party server-side code to cancel a toast queued earlier in the same request — for example, after a later validation step supersedes an earlier success message.

#### Scenario: Third party removes a queued toast before it reaches the client

- **WHEN** `$id = wp_tosuto('Saved')` is called and later in the same request `wp_tosuto_remove($id)` is called
- **THEN** `wp_tosuto_remove()` returns `true`, the toast is absent from `state.toasts` on hydration, and no corresponding toast element is rendered

#### Scenario: Removing an unknown id is a no-op

- **WHEN** `wp_tosuto_remove('not-a-real-id')` is called
- **THEN** the function returns `false` and the queue is unchanged

### Requirement: PHP-queued toasts reach the page

Toasts queued via `wp_tosuto()` during a PHP request SHALL be present in `state.toasts` as fully-formed toast objects by the time the `wp-tosuto` store has hydrated on the client — each with a unique `id` and with default `variant` (`default`), `duration` (`5000`), and `dismissable` (`true`) values applied wherever the caller omitted them.

#### Scenario: Queued PHP toast is visible after hydration

- **WHEN** `wp_tosuto('Settings saved', ['variant' => 'success'])` is called during a PHP request
- **THEN** after the page loads in a browser, a success toast with content "Settings saved" is visible, and the matching toast in `state.toasts` has a unique `id`, `duration: 5000`, and `dismissable: true`

#### Scenario: No toasts reach the page when none are queued

- **WHEN** no toasts have been queued via `wp_tosuto()` during a request
- **THEN** `state.toasts` is empty on hydration and no toast elements are in the rendered DOM

### Requirement: JS store action API

Client-side code SHALL create toasts by calling `store('wp-tosuto').actions.add(content, options)` where `content` is a required string and `options` is an optional object supporting `variant` (string), `duration` (number), and `dismissable` (boolean) keys. This mirrors the PHP `wp_tosuto(string $content, array $options = [])` signature so server and client APIs are consistent.

#### Scenario: Creating a toast from JS

- **WHEN** client-side code calls `store('wp-tosuto').actions.add('Uploaded!', { variant: 'success' })`
- **THEN** a success toast with content "Uploaded!" appears immediately

### Requirement: JS return value

The `actions.add()` action SHALL return the unique `id` of the created toast, allowing the caller to programmatically remove it later via `actions.remove(id)`.

#### Scenario: Using returned ID to remove a toast

- **WHEN** `const id = actions.add('Loading...', { duration: 0 })` is called, then later `actions.remove(id)` is called
- **THEN** the toast is removed from the page
