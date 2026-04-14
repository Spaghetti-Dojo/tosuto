## Why

WordPress lacks a modern, reusable toast notification system built on the Interactivity API. Developers resort to custom alert implementations or jQuery-based solutions that don't align with WordPress's reactive, standards-based frontend direction. A Shadcn-inspired toast component would provide a clean, stackable, dismissable notification system any plugin or theme can leverage with minimal effort.

## What Changes

- New WordPress plugin (`wp-toast`) providing a toast notification component via the Interactivity API
- Toast notifications accept arbitrary content (text, HTML, icons, action buttons)
- Multiple toasts stack vertically with smooth enter/exit animations
- Each toast is individually dismissable via a close button
- Toasts auto-dismiss after a configurable duration (default ~5s)
- PHP API (`wp_toast()`) and JavaScript API via the Interactivity API store for programmatic toast creation
- Shadcn-inspired minimal design with CSS custom properties for theming
- Toast variants: `default`, `success`, `error`, `warning`, `info`

## Capabilities

### New Capabilities

- `toast-store`: Reactive state management for toast notifications using the Interactivity API store — handles adding, removing, stacking order, and auto-dismiss timers
- `toast-renderer`: Visual rendering of the toast container and individual toast items — animations, dismiss button, variant styling, and content projection
- `toast-api`: Public PHP and JS APIs for creating toasts — server-side `wp_toast()` helper that enqueues toasts on page load, and client-side store actions for runtime toast creation
- `plugin`: Plugin bootstrap concerns — standard WordPress plugin headers and minimum WordPress/PHP version gates that govern when WordPress will activate the plugin
- `assets`: Conditional loading of toast frontend scripts and styles, so they only ship to pages where the toaster block is present

### Modified Capabilities

_None — this is a new plugin._

## Impact

- **New plugin directory**: Full plugin scaffold with block registration, Interactivity API module, view script, render PHP, and stylesheet
- **Dependencies**: Requires WordPress 6.9+ (stable Interactivity API), `@wordpress/interactivity` package, and `dompurify` (client-side HTML sanitizer used inside the store's `actions.add`)
- **Build tooling**: Requires `@wordpress/scripts` for compiling Interactivity API modules
- **No breaking changes**: Entirely additive, no modifications to existing systems
