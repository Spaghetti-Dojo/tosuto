<?php

declare(strict_types=1);

static $rendered = false;

if ($rendered) {
    return;
}

$rendered = true;

$position = $attributes['position'] ?? 'bottom-right';
?>
<div
    data-wp-interactive="wp-tosuto"
    data-wp-init="callbacks.init"
    class="wp-tosuto"
    role="status"
    aria-live="polite"
    aria-atomic="false"
    data-position="<?= esc_attr($position) ?>"
>
    <template data-wp-each="state.toastList">
        <div
            class="wp-tosuto__item"
            data-wp-bind--data-variant="context.item.variant"
            data-wp-on--mouseenter="callbacks.pauseToast"
            data-wp-on--mouseleave="callbacks.resumeToast"
        >
            <div
                class="wp-tosuto__content"
                data-wp-watch="callbacks.renderContent"
            ></div>
            <button
                class="wp-tosuto__dismiss"
                type="button"
                aria-label="<?php esc_attr_e('Dismiss notification', 'wp-tosuto') ?>"
                data-wp-bind--hidden="!context.item.dismissable"
                data-wp-on--click="callbacks.dismiss"
            >
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </template>
</div>
