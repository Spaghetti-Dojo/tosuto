# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress Plugin that renders Toasts Elements programmatically inspired by the shadcn / ui design system. It combines PHP modules for server-side block customization with TypeScript/SCSS for frontend styling.
It adheres to Spec Driven Development by using open-spec.

## Architecture

### PHP Backend (`/sources/server/`)

The project uses `inpsyde/modularity` for dependency injection. `/index.php` bootstraps via `boot()` at `plugins_loaded`, which calls `/inc/package.php` to register five modules:

Each module has a `Module.php` implementing the Modularity contract, with additional classes for specific concerns.

### Frontend (`/sources/client/`)

SCSS is organized atomically:
- `atoms/` — basic elements (buttons, inputs, typography)
- `molecules/` — component combinations
- `organisms/` — complex compositions
- `templates/` - page layouts
- `pages/` - specific page styles
- `block-styles/` — block-specific overrides
- `mixins/` — reusable SCSS mixins
