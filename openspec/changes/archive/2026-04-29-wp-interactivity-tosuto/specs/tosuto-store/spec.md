## ADDED Requirements

### Requirement: Store namespace registration

The plugin SHALL register an Interactivity API store under the `wp-tosuto` namespace.

#### Scenario: Store is available after hydration

- **WHEN** a page containing the toaster block has finished hydrating in the browser
- **THEN** the `wp-tosuto` store is accessible via `store('wp-tosuto')` from any Interactivity API module

### Requirement: Toast state structure

Each toast in `state.toasts` SHALL be an object with the following properties: `id` (string, unique), `content` (string, sanitized HTML), `variant` (string, one of `default`, `success`, `error`, `warning`, `info`), `duration` (number, milliseconds), and `dismissable` (boolean).

#### Scenario: Toast object shape

- **WHEN** a toast is added to the store
- **THEN** the toast object contains `id`, `content`, `variant`, `duration`, and `dismissable` fields with correct types

### Requirement: Add toast action

The store SHALL expose an `actions.add(content, options)` action that creates a new toast, assigns it a unique ID, applies default values for omitted options (`variant: 'default'`, `duration: 5000`, `dismissable: true`), and appends it to `state.toasts`. `content` is a required string; `options` is an optional object accepting `variant`, `duration`, and `dismissable`.

#### Scenario: Adding a toast with minimal arguments

- **WHEN** `actions.add('Hello')` is called
- **THEN** a new toast with `content: 'Hello'`, `variant: 'default'`, `duration: 5000`, `dismissable: true`, and a unique `id` is appended to `state.toasts`

#### Scenario: Adding a toast with custom options

- **WHEN** `actions.add('<b>Error</b>', { variant: 'error', duration: 10000 })` is called
- **THEN** a new toast with `variant: 'error'` and `duration: 10000` is appended to `state.toasts`

### Requirement: Remove toast action

The store SHALL expose an `actions.remove(id)` action that removes the toast with the matching `id` from `state.toasts`.

#### Scenario: Removing an existing toast

- **WHEN** `actions.remove('toast-123')` is called and a toast with `id: 'toast-123'` exists
- **THEN** the toast is removed from `state.toasts`

#### Scenario: Removing a non-existent toast

- **WHEN** `actions.remove('nonexistent')` is called
- **THEN** `state.toasts` is unchanged and no error is thrown

### Requirement: Auto-dismiss timer

When a toast is added with `duration > 0`, the toast SHALL be automatically removed from `state.toasts` after the specified number of milliseconds have elapsed.

#### Scenario: Toast auto-dismisses after duration

- **WHEN** a toast is added with `duration: 3000`
- **THEN** the toast is automatically removed from `state.toasts` after 3000 milliseconds

#### Scenario: Toast with zero duration persists

- **WHEN** a toast is added with `duration: 0`
- **THEN** the toast remains in `state.toasts` indefinitely until manually dismissed

### Requirement: Pause timer on hover

The store SHALL expose `actions.pauseTimer(id)` and `actions.resumeTimer(id)` actions. When a toast's timer is paused, the remaining time SHALL be preserved and resumed from that point.

#### Scenario: Hovering pauses auto-dismiss

- **WHEN** a toast has 2000ms remaining and `actions.pauseTimer(id)` is called
- **THEN** the auto-dismiss countdown stops at 2000ms remaining

#### Scenario: Unhovering resumes auto-dismiss

- **WHEN** `actions.resumeTimer(id)` is called after a pause with 2000ms remaining
- **THEN** the toast auto-dismisses after approximately 2000ms

### Requirement: Timer initialization for server-hydrated toasts

When the `wp-tosuto` store is first hydrated and `state.toasts` already contains toasts (for example, toasts queued server-side by `wp_tosuto()`), auto-dismiss timers SHALL be started for any such toast with `duration > 0`.

#### Scenario: Hydrated toasts auto-dismiss

- **WHEN** the store is hydrated with `state.toasts` containing `[{ id: 'abc', content: 'Saved', variant: 'success', duration: 5000, dismissable: true }]`
- **THEN** the toast is removed from `state.toasts` after 5000ms

#### Scenario: Empty hydrated state is a no-op

- **WHEN** the store is hydrated with an empty `state.toasts`
- **THEN** no timers are started and no errors occur

### Requirement: Content is sanitized on the client

The store SHALL sanitize every toast's `content` on the client, regardless of how the toast entered `state.toasts`. This SHALL apply in two places:

1. When a toast is added via `actions.add`, `content` SHALL be sanitized before the new toast object is appended to `state.toasts`.
2. When the store is hydrated with toasts already present in `state.toasts` (for example, toasts queued server-side), each hydrated toast's `content` SHALL be sanitized in place before any consumer (renderer, timers, or other callbacks) reads it. The client SHALL NOT rely on the server having sanitized the content.

Sanitization SHALL remove executable HTML (for example `<script>` elements, inline event-handler attributes, and `javascript:` URLs) while preserving safe formatting elements. After sanitization, downstream consumers of `state.toasts` SHALL be able to treat `content` as safe HTML.

#### Scenario: Script elements are stripped on add

- **WHEN** `actions.add('Saved <script>alert(1)</script>')` is called
- **THEN** the resulting entry in `state.toasts` has `content` with the `<script>` element removed

#### Scenario: Inline event handlers are stripped on add

- **WHEN** `actions.add('<a href="#" onclick="alert(1)">click</a>')` is called
- **THEN** the resulting entry in `state.toasts` has `content` containing an anchor element with no `onclick` attribute

#### Scenario: Safe formatting is preserved on add

- **WHEN** `actions.add('<strong>Saved</strong> successfully')` is called
- **THEN** the resulting entry in `state.toasts` has `content` containing a `<strong>` element wrapping the text "Saved"

#### Scenario: Hydrated toasts are re-sanitized on the client

- **WHEN** the store is hydrated with `state.toasts` containing `[{ id: 'abc', content: 'Saved <script>alert(1)</script>', variant: 'success', duration: 5000, dismissable: true }]`
- **THEN** before any consumer reads the entry, its `content` has the `<script>` element removed, even though the server was expected to have sanitized it already

### Requirement: Stacking order

`state.toasts` SHALL maintain insertion order (oldest first, newest last).

#### Scenario: Multiple toasts maintain order

- **WHEN** toast A is added, then toast B is added, then toast C is added
- **THEN** `state.toasts` contains `[A, B, C]` in that order
