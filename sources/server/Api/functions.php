<?php

declare(strict_types=1);

use SpaghettiDojo\Tosuto\Api\Queue;

/**
 * @param array{variant?: string, duration?: int, dismissable?: bool} $options
 */
function wp_tosuto(string $content, array $options = []): string
{
    return Queue::add($content, $options);
}

function wp_tosuto_remove(string $id): bool
{
    return Queue::remove($id);
}
