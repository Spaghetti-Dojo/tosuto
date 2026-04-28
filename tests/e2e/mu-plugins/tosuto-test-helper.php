<?php
/**
 * MU-Plugin: Tosuto E2E Test Helper
 *
 * Queues test toasts via wp_tosuto() when specific query params are present.
 * Only active in wp-env testing environments.
 */

declare(strict_types=1);

add_action('template_redirect', static function (): void {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (!isset($_GET['tosuto-test'])) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $scenario = sanitize_text_field(wp_unslash($_GET['tosuto-test']));

    switch ($scenario) {
        case 'js':
            add_action('wp_footer', static function (): void {
                ?>
                <script type="module">
                    import { store } from '@wordpress/interactivity';
                    const { actions } = store('wp-tosuto');
                    actions.add('JS Toast Content', { variant: 'success' });
                </script>
                <?php
            });
            break;

        case 'php':
            wp_tosuto('<strong>PHP Toast</strong> — queued server-side', [
                'variant' => 'default',
                'duration' => 5000,
            ]);
            break;

        case 'php-success':
            wp_tosuto('Success toast from PHP', [
                'variant' => 'success',
                'duration' => 5000,
            ]);
            break;

        case 'php-error':
            wp_tosuto('Error toast from PHP', [
                'variant' => 'error',
                'duration' => 5000,
            ]);
            break;

        case 'php-warning':
            wp_tosuto('Warning toast from PHP', [
                'variant' => 'warning',
                'duration' => 5000,
            ]);
            break;

        case 'php-info':
            wp_tosuto('Info toast from PHP', [
                'variant' => 'info',
                'duration' => 5000,
            ]);
            break;

        case 'php-multiple':
            wp_tosuto('First toast', ['variant' => 'default', 'duration' => 10000]);
            wp_tosuto('Second toast', ['variant' => 'success', 'duration' => 10000]);
            wp_tosuto('Third toast', ['variant' => 'error', 'duration' => 10000]);
            break;

        case 'php-no-dismiss':
            wp_tosuto('Cannot dismiss this', [
                'variant' => 'default',
                'duration' => 0,
                'dismissable' => false,
            ]);
            break;

        case 'php-short-duration':
            wp_tosuto('Gone in 1 second', [
                'variant' => 'default',
                'duration' => 1000,
            ]);
            break;

        case 'php-all-variants':
            wp_tosuto('Default variant', ['variant' => 'default', 'duration' => 0]);
            wp_tosuto('Success variant', ['variant' => 'success', 'duration' => 0]);
            wp_tosuto('Error variant', ['variant' => 'error', 'duration' => 0]);
            wp_tosuto('Warning variant', ['variant' => 'warning', 'duration' => 0]);
            wp_tosuto('Info variant', ['variant' => 'info', 'duration' => 0]);
            break;
    }
});
