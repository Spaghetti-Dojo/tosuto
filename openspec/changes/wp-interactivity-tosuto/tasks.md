## 1. Plugin Scaffold

- [x] 1.1 Create plugin directory structure with only two source roots: `wp-tosuto/sources/client/` (SCSS, JS/TS sources) and `wp-tosuto/sources/server/` (PHP modules)
- [x] 1.2 Create `composer.json` with `inpsyde/modularity` dependency and PSR-4 autoload mapping the plugin root namespace to `sources/server/`
- [x] 1.3 Run `composer install` to generate `vendor/autoload.php`
- [x] 1.4 Create main plugin file `wp-tosuto.php` with plugin headers (Name, Description, Version, Requires at least: 6.9, Requires PHP: 8.4, Text Domain: wp-tosuto), require `vendor/autoload.php`, create `Package::new()`, register all modules via `addModule()`, and call `boot()`
- [x] 1.5 Create Module classes in each `sources/server/` subdirectory (e.g., `sources/server/Toaster/Module.php` for block registration and render, `sources/server/Api/Module.php` for the `wp_tosuto()` helper) implementing the appropriate Inpsyde Modularity interfaces (`ServiceModule`, `ExecutableModule`)
- [x] 1.6 Create `package.json` with `@wordpress/scripts`, `@wordpress/interactivity`, and `dompurify` dependencies; configure the build to read from `sources/client/` instead of the default `src/`
- [x] 1.7 Create `block.json` for the toaster block (under `sources/client/toaster/` with `viewScriptModule`, `style`, and `"render": "file:../../server/Toaster/render.php"`, or whichever co-location the build tooling supports)

## 2. Interactivity API Store (tosuto-store)

- [x] 2.0 Create `sources/client/toaster/types.ts` declaring the options object accepted by `actions.add` and the variant/id aliases. This module SHALL NOT be re-exported from `view.ts`, and `package.json` SHALL NOT expose a `types` / `.d.ts` entry for it. The `Toast` and `Timer` entities are classes (see 2.0a, 2.0c), not exported type aliases
- [x] 2.0a Create `sources/client/toaster/toast.ts` — a `Toast` entity class with `readonly` fields (`id`, `content`, `variant`, `duration`, `dismissable`) whose constructor accepts a raw input object and owns the invariants: generate an `id` via `crypto.randomUUID()` with a counter fallback, sanitize `content` via DOMPurify, and apply defaults (`variant: 'default'`, `duration: 5000`, `dismissable: true`) for omitted fields. Both `actions.add` and `callbacks.init` SHALL funnel through this constructor — `view.ts` never sanitizes, id-generates, or applies defaults on its own
- [x] 2.0b Create `sources/client/toaster/value-objects/immutable-record.ts` — a small `ImmutableRecord<T>` class modeled on the `Spaghetti-Dojo/kensaku` pattern (`sources/client/src/models/immutable-record.ts`) that wraps a `Readonly<Record<string, T>>` and exposes `get(key, fallback?)` with overloads (returns `T | undefined` without fallback, `T` with fallback), `set(key, value)` (returns a new record), and `delete(key)` (returns a new record without the key). This replaces the `Map` used for timer tracking so mutations are explicit reassignments, consistent with the immutable-by-replacement convention used for `Toast` and `Timer`
- [x] 2.0c Create `sources/client/toaster/value-objects/timer.ts` — a `Timer` value object with `#private` state (`handle`, `remaining`, `startedAt`), a static `Timer.start(duration, onExpire)` factory (returns `NullTimer` when `duration <= 0` or non-finite), and instance methods `pause()` / `resume(onExpire)` / `clear()`. In the same file, a `NullTimer` subclass extends `Timer` and overrides every method as a no-op (pause/resume return `this`, clear does nothing). Paired classes share the file under a targeted `eslint-disable max-classes-per-file` comment because splitting them produces a class-initialization TDZ cycle
- [x] 2.0d Create `sources/client/toaster/value-objects/timer-collection.ts` — a `TimerCollection` class that wraps `ImmutableRecord<Timer>` and encapsulates all timer lifecycle operations: `schedule(key, duration, onExpire)` starts a timer and returns a new collection (or `this` if the entry is null), `pause(key)` pauses the entry and returns a new collection, `resume(key, onExpire)` resumes and returns a new collection, `clear(key)` clears the handle and removes the entry. Each method absorbs the null-entry logic internally (using a module-level `NullTimer` sentinel). This replaces the standalone `scheduleTimer()` helper and the scattered `ImmutableRecord` / `NullTimer` imports that previously lived in `view.ts`
- [x] 2.1 Create `sources/client/toaster/view.ts` — register the `wp-tosuto` store with `state.toasts` as a `Map<ToastId, Toast>` (default empty Map, keyed by toast id) and a module-level `timers` binding typed as `TimerCollection`; import the `Toast` class and `TimerCollection` locally, and pull `ToastId` / `RawToast` from `./types` (no inline `interface` / `type` declarations, no re-exports). Store actions call `timers.schedule(...)` / `timers.pause(...)` / `timers.resume(...)` / `timers.clear(...)` directly — no standalone helper needed. Every mutation to `state.toasts` reassigns the binding to a new `Map` (immutable-by-replacement) so the Interactivity API proxy detects the change
- [x] 2.2 Implement `actions.add(content, options)` — construct a `Toast`, insert it into `state.toasts` via `new Map(state.toasts).set(toast.id, toast)`, start auto-dismiss timer, return ID. Signature mirrors PHP `wp_tosuto(string $content, array $options = [])`
- [x] 2.3 Implement `actions.remove(id)` — guard with `state.toasts.has(id)`, copy the Map, delete the key, reassign `state.toasts`, clear its timer
- [x] 2.4 Implement `actions.pauseTimer(id)` and `actions.resumeTimer(id)` — track remaining time, clear/restart timer
- [x] 2.5 Implement auto-dismiss: on add, set `setTimeout` for `duration` ms that calls `actions.remove(id)`; skip if `duration === 0`
- [x] 2.6 Implement `callbacks.init` — reads server-queued toasts via `getServerState()` (the Map is always empty at init since server hydration does not overwrite it) and funnels each entry through `actions.add`, which sanitizes via the `Toast` constructor and starts auto-dismiss timers
- [x] 2.7 Implement a `callbacks.renderContent` callback that writes `innerHTML` via `data-wp-watch` + `getElement()` + `getContext()`. The callback reads the toast id from context, looks up the toast in `state.toasts`, and assigns `content` to `ref.innerHTML`. `data-wp-watch` (backed by `useSignalEffect`) auto-tracks reactive state and re-fires after paint when dependencies change. This is the only place in the view module that writes raw HTML; it does not sanitize (content is already sanitized on entry to `state.toasts`). No custom directive registration is needed — `directive()` is behind the `privateApis` lock and not publicly available.

## 3. Block Rendering (tosuto-renderer)

- [x] 3.1 Create `sources/server/Toaster/render.php` — render the toast container `<div>` with `data-wp-interactive="wp-tosuto"`, `role="status"`, `aria-live="polite"`, fixed positioning, and `data-wp-each` for toast items
- [x] 3.2 Add single-instance guard in the render file — use static flag to prevent duplicate containers
- [x] 3.3 Add toast item template inside `<template data-wp-each="state.toasts">` — write `content` via the `data-wp-tosuto--html` custom directive (the single HTML write site), bind the variant class, render the dismiss button conditionally on `dismissable`, and attach hover event directives
- [x] 3.4 Register blocks in the `Toaster` module via `wp_register_block_types_from_metadata_collection()` using the `blocks-manifest.php` in the build output directory

## 4. Styling

- [x] 4.1 Create `sources/client/toaster/style.scss` with base toast contaiπner styles (fixed position, flexbox column, z-index, gap)
- [x] 4.2 Add CSS custom properties: `--wp-tosuto-bg`, `--wp-tosuto-fg`, `--wp-tosuto-border`, `--wp-tosuto-radius`, `--wp-tosuto-shadow`, `--wp-tosuto-font-size`, `--wp-tosuto-padding`, `--wp-tosuto-gap`, `--wp-tosuto-z-index`
- [x] 4.3 Add variant styles: `.wp-tosuto--default`, `.wp-tosuto--success`, `.wp-tosuto--error`, `.wp-tosuto--warning`, `.wp-tosuto--info` with variant-specific custom properties
- [x] 4.4 Add enter animation (slide-up + fade-in, 200ms) and exit animation (fade-out + slide-down, 150ms) using CSS keyframes
- [x] 4.5 Add position variants via `[data-position]` attribute selector: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`

## 5. PHP API (tosuto-api)

- [x] 5.1 In the `Api` module, implement `wp_tosuto(string $content, array $options = []): string` — generate a UUID via `wp_generate_uuid4()`, apply defaults (`variant: 'default'`, `duration: 5000`, `dismissable: true`) for omitted options, sanitize `$content` via `wp_kses_post()` before storing, append the fully-formed entry to a static request-scoped queue, and return the id
- [x] 5.2 In the `Api` module, implement `wp_tosuto_remove(string $id): bool` — remove a previously-queued entry from the same static queue and return whether anything was removed
- [x] 5.3 In the `Api` module, hook into `wp_footer` at a late priority. If the queue is non-empty, call `wp_interactivity_state('wp-tosuto', ['toasts' => $queue])` and then emit the toaster block via `do_blocks('<!-- wp:wp-tosuto/toaster /-->')`. No defaulting or id assignment happens here; the queue is already final
- [x] 5.4 In the same `wp_footer` hook, when the queue is empty, apply the `wp-tosuto.api.render-empty` filter (default `true`) and resolve its value: `true` → emit the toaster block; `false` → emit nothing; `is_callable(...)` → `call_user_func()` it with no arguments and use the coerced-to-bool result (so `'is_singular'`, `'is_single'`, `'is_post_type_archive'`, or a closure can all be passed); any other value → coerce to bool. When the resolved decision is "do not emit", neither `wp_interactivity_state()` nor `do_blocks()` runs, so no `wp-tosuto` view script module or stylesheet is enqueued
- [x] 5.5 Document the `wp-tosuto.api.render-empty` filter in the plugin's inline PHPDoc on the hook site, including the four accepted value shapes and the intent that callables are treated as template-tag-style conditionals invoked with no arguments

## 6. Build & Verification

- [x] 6.1 Run `npx @wordpress/scripts build` to compile the Interactivity API module and CSS
- [x] 6.2 Verify the plugin activates without errors on a WordPress 6.9+ environment

## 7. E2E Tests (Playwright + wp-env)

- [ ] 7.1 Add `@wordpress/e2e-test-utils-playwright` and `@playwright/test` to devDependencies, create Playwright config pointing at wp-env
- [ ] 7.2 Create a mu-plugin that queues test toasts via `wp_tosuto()` when a specific query param is present (e.g. `?tosuto-test=php`)
- [ ] 7.3 E2E: PHP-queued toast is visible after page load with correct content and variant class
- [ ] 7.4 E2E: JS `store('wp-tosuto').actions.add()` creates toast in DOM with correct content and variant class
- [ ] 7.5 E2E: multiple toasts stack vertically
- [ ] 7.6 E2E: dismiss button removes only the clicked toast
- [ ] 7.7 E2E: toast auto-dismisses after duration
- [ ] 7.8 E2E: hover pauses auto-dismiss, mouseleave resumes it
- [ ] 7.9 E2E: variant classes (default, success, error, warning, info) render correctly
