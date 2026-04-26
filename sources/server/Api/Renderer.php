<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\Api;

/**
 * @internal
 */
final class Renderer
{
    private static string $output = '';

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function init(): void
    {
        add_action('wp_body_open', $this->render(...), PHP_INT_MAX);
        add_action('wp_footer', $this->print(...), PHP_INT_MAX);
    }

    private function render(): void
    {
        if (Queue::isEmpty() && !$this->shouldRenderEmpty()) {
            return;
        }

        if (!Queue::isEmpty()) {
            wp_interactivity_state('wp-tosuto', ['toasts' => Queue::items()]);
        }

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- block renders its own output
        self::$output = do_blocks('<!-- wp:wp-tosuto/toaster /-->');
    }

    private function print(): void
    {
        echo self::$output;
    }

    /**
     * Resolve the `wp-tosuto.api.render-empty` filter value.
     *
     * Accepted shapes:
     * - `true`     — render an empty container (default).
     * - `false`    — do not render.
     * - callable   — invoked with no arguments, result coerced to bool.
     *                Accepts WP template-tag conditionals as strings
     *                (e.g. `'is_singular'`, `'is_single'`, `'is_post_type_archive'`)
     *                or closures, so themes can gate rendering without
     *                wrapping each conditional in a closure.
     * - any other  — coerced to bool.
     */
    private function shouldRenderEmpty(): bool
    {
        /** @var mixed $value */
        $value = apply_filters('wp-tosuto.api.render-empty', true);

        if (is_bool($value)) {
            return $value;
        }

        if (is_callable($value)) {
            return (bool) $value();
        }

        return (bool) $value;
    }
}
