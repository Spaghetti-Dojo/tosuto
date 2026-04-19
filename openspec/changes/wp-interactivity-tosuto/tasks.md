## 1. Plugin Scaffold

- [x] 1.1 Create plugin directory structure with only two source roots: `wp-tosuto/sources/client/` (SCSS, JS/TS sources) and `wp-tosuto/sources/server/` (PHP modules)
- [x] 1.2 Create `composer.json` with `inpsyde/modularity` dependency and PSR-4 autoload mapping the plugin root namespace to `sources/server/`
- [x] 1.3 Run `composer install` to generate `vendor/autoload.php`
- [x] 1.4 Create main plugin file `wp-tosuto.php` with plugin headers (Name, Description, Version, Requires at least: 6.9, Requires PHP: 8.4, Text Domain: wp-tosuto), require `vendor/autoload.php`, create `Package::new()`, register all modules via `addModule()`, and call `boot()`
- [x] 1.5 Create Module classes in each `sources/server/` subdirectory (e.g., `sources/server/Toaster/Module.php` for block registration and render, `sources/server/Api/Module.php` for the `wp_tosuto()` helper) implementing the appropriate Inpsyde Modularity interfaces (`ServiceModule`, `ExecutableModule`)
- [x] 1.6 Create `package.json` with `@wordpress/scripts`, `@wordpress/interactivity`, and `dompurify` dependencies; configure the build to read from `sources/client/` instead of the default `src/`
- [x] 1.7 Create `block.json` for the toaster block (under `sources/client/toaster/` with `viewScriptModule`, `style`, and `"render": "file:../../server/Toaster/render.php"`, or whichever co-location the build tooling supports)

## 2. Interactivity API Store (tosuto-store)

- [ ] 2.1 Create `sources/client/toaster/view.js` — register the `wp-tosuto` store with `state.toasts` array (default `[]`, merged with server state at hydration) and a module-level timer tracking map
- [ ] 2.2 Implement `actions.add(content, options)` — generate unique ID, apply defaults (variant: 'default', duration: 5000, dismissable: true), sanitize `content` via DOMPurify before appending to `state.toasts`, start auto-dismiss timer, return ID. Signature mirrors PHP `wp_tosuto(string $content, array $options = [])`
- [ ] 2.3 Implement `actions.remove(id)` — find and remove toast by ID from state.toasts, clear its timer
- [ ] 2.4 Implement `actions.pauseTimer(id)` and `actions.resumeTimer(id)` — track remaining time, clear/restart timer
- [ ] 2.5 Implement auto-dismiss: on add, set `setTimeout` for `duration` ms that calls `actions.remove(id)`; skip if `duration === 0`
- [ ] 2.6 Implement `callbacks.init` — iterate `state.toasts`, sanitize each hydrated toast's `content` via DOMPurify in place (the client does not trust server-side sanitization), then start auto-dismiss timers for any toast with `duration > 0`
- [ ] 2.7 Register a single custom Interactivity API directive (e.g. `data-wp-tosuto--html`) whose callback assigns `innerHTML` from the bound expression. This is the only place in the view module that writes raw HTML; it does not sanitize (content is already sanitized on entry to `state.toasts`).

## 3. Block Rendering (tosuto-renderer)

- [ ] 3.1 Create `sources/server/Toaster/render.php` — render the toast container `<div>` with `data-wp-interactive="wp-tosuto"`, `role="status"`, `aria-live="polite"`, fixed positioning, and `data-wp-each` for toast items
- [ ] 3.2 Add single-instance guard in the render file — use static flag to prevent duplicate containers
- [ ] 3.3 Add toast item template inside `<template data-wp-each="state.toasts">` — write `content` via the `data-wp-tosuto--html` custom directive (the single HTML write site), bind the variant class, render the dismiss button conditionally on `dismissable`, and attach hover event directives
- [ ] 3.4 Register blocks in the `Toaster` module via `wp_register_block_types_from_metadata_collection()` using the `blocks-manifest.php` in the build output directory

## 4. Styling

- [ ] 4.1 Create `sources/client/toaster/style.scss` with base toast container styles (fixed position, flexbox column, z-index, gap)
- [ ] 4.2 Add CSS custom properties: `--wp-tosuto-bg`, `--wp-tosuto-fg`, `--wp-tosuto-border`, `--wp-tosuto-radius`, `--wp-tosuto-shadow`, `--wp-tosuto-font-size`, `--wp-tosuto-padding`, `--wp-tosuto-gap`, `--wp-tosuto-z-index`
- [ ] 4.3 Add variant styles: `.wp-tosuto--default`, `.wp-tosuto--success`, `.wp-tosuto--error`, `.wp-tosuto--warning`, `.wp-tosuto--info` with variant-specific custom properties
- [ ] 4.4 Add enter animation (slide-up + fade-in, 200ms) and exit animation (fade-out + slide-down, 150ms) using CSS keyframes
- [ ] 4.5 Add position variants via `[data-position]` attribute selector: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`

## 5. PHP API (tosuto-api)

- [ ] 5.1 In the `Api` module, implement `wp_tosuto(string $content, array $options = []): string` — generate a UUID via `wp_generate_uuid4()`, apply defaults (`variant: 'default'`, `duration: 5000`, `dismissable: true`) for omitted options, sanitize `$content` via `wp_kses_post()` before storing, append the fully-formed entry to a static request-scoped queue, and return the id
- [ ] 5.2 In the `Api` module, implement `wp_tosuto_remove(string $id): bool` — remove a previously-queued entry from the same static queue and return whether anything was removed
- [ ] 5.3 In the `Api` module, hook into `wp_footer` at a late priority. If the queue is non-empty, call `wp_interactivity_state('wp-tosuto', ['toasts' => $queue])` and then emit the toaster block via `do_blocks('<!-- wp:wp-tosuto/toaster /-->')`. No defaulting or id assignment happens here; the queue is already final
- [ ] 5.4 In the same `wp_footer` hook, when the queue is empty, apply the `wp_tosuto_render_empty` filter (default `true`) and resolve its value: `true` → emit the toaster block; `false` → emit nothing; `is_callable(...)` → `call_user_func()` it with no arguments and use the coerced-to-bool result (so `'is_singular'`, `'is_single'`, `'is_post_type_archive'`, or a closure can all be passed); any other value → coerce to bool. When the resolved decision is "do not emit", neither `wp_interactivity_state()` nor `do_blocks()` runs, so no `wp-tosuto` view script module or stylesheet is enqueued
- [ ] 5.5 Document the `wp_tosuto_render_empty` filter in the plugin's inline PHPDoc on the hook site, including the four accepted value shapes and the intent that callables are treated as template-tag-style conditionals invoked with no arguments

## 6. Build & Verification

- [ ] 6.1 Run `npx @wordpress/scripts build` to compile the Interactivity API module and CSS
- [ ] 6.2 Verify the plugin activates without errors on a WordPress 6.9+ environment
- [ ] 6.3 Test toast creation via PHP API (`wp_tosuto()`) and JS API (`store('wp-tosuto').actions.add()`)
- [ ] 6.4 Test stacking, dismissal, auto-dismiss timer, hover pause, and variant styling
