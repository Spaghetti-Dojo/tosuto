<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\Api;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Psr\Container\ContainerInterface;

final class Module implements ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function run(ContainerInterface $container): bool
    {
        return true;
    }
}
