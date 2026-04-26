<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\Api;

/**
 * @internal
 * @phpstan-type ToastEntry array{
 *     id: string,
 *     content: string,
 *     variant: string,
 *     duration: int,
 *     dismissable: bool,
 * }
 */
final class Queue
{
    /** @var list<ToastEntry> */
    private static array $items = [];

    /**
     * @param array{variant?: string, duration?: int, dismissable?: bool} $options
     */
    public static function add(string $content, array $options = []): string
    {
        $id = wp_generate_uuid4();

        self::$items[] = [
            'id' => $id,
            'content' => wp_kses_post($content),
            'variant' => $options['variant'] ?? 'default',
            'duration' => $options['duration'] ?? 5000,
            'dismissable' => $options['dismissable'] ?? true,
        ];

        return $id;
    }

    public static function remove(string $id): bool
    {
        foreach (self::$items as $index => $item) {
            if ($item['id'] === $id) {
                array_splice(self::$items, $index, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * @return list<ToastEntry>
     */
    public static function items(): array
    {
        return self::$items;
    }

    public static function isEmpty(): bool
    {
        return self::$items === [];
    }
}
