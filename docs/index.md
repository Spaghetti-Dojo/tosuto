---
slug: /
sidebar_position: 1
---

# WP Tosuto — Documentation

WP Tosuto is a WordPress plugin that renders programmatic toast notifications via the [WordPress Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity/), inspired by [shadcn/ui](https://ui.shadcn.com/).

## Contents

- [PHP API](server/php-api.md) — public functions, classes, and hooks for server-side use
- [JavaScript / TypeScript API](client/js-api.md) — Interactivity API store, actions, types, and value objects

## Quick Start

### Server side

```php
// Add a success toast from any PHP context
wp_tosuto( 'Settings saved!', [
    'variant'    => 'success',
    'duration'   => 3000,
    'dismissable' => true,
] );
```

### Client side

```typescript
import { store } from '@wordpress/interactivity';

const { actions } = store( 'wp-tosuto' );

actions.add( 'File uploaded successfully!', {
    variant:    'success',
    duration:   4000,
    dismissable: true,
} );
```