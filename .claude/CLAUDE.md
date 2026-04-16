# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress Plugin that renders Toasts Elements programmatically inspired by the shadcn / ui design system. It combines PHP modules for server-side block customization with TypeScript/SCSS for frontend styling.

## Commands

### JavaScript / TypeScript

```bash
pnpm start          # Dev build with hot reload
pnpm build          # Production build
pnpm lint:js        # ESLint
pnpm lint:js:fix    # Auto-fix ESLint issues
pnpm lint:css       # Stylelint
pnpm lint:css:fix   # Auto-fix Stylelint issues
pnpm format         # Prettier formatting
```

### PHP

```bash
composer cs                # PHPCS (Syde standard)
composer cs:fix            # Auto-fix PHPCS issues
composer analysis          # PHPStan (level 9)
composer test:unit         # Unit tests (Pest)
composer test:integraction # Functional tests (Pest)
composer tests             # All tests
composer qa                # cs + analysis + tests
```

### WordPress Environment

```bash
pnpm env start      # Start local WordPress (wp-env)
pnpm env stop       # Stop environment
```

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

Webpack scans `/sources/client/styles/` for SCSS entry points and compiles them to `/dist/styles/`. Config extends `@wordpress/scripts`.

### Testing

Tests live in `/tests/` with separate suites:
- `unit/server/` — isolated PHP unit tests using Brain Monkey mocks
- `integration/server/` — integration tests that load WordPress (WorDBless/SQLite)

## Quality Gates

After completing edits, always run the linter for the affected layer before considering the task done:

- PHP files → `composer cs && composer analysis`
- TS/JS files → `pnpm lint:js`
- SCSS/CSS files → `pnpm lint:css`

Before committing, run the full suite: `composer qa && pnpm lint:js && pnpm lint:css`. Do not commit if any linter or test reports an error.

## Git Commit Style

Per `.github/git-commit-instructions.md`:
- Title max 50 characters; body max 72 characters per line
- Title and body separated by a blank line
- Avoid verbose descriptions
