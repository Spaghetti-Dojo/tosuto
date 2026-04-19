<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\Tests;

use Brain\Monkey;

uses()
    ->beforeEach(function (): void {
        Monkey\setUp();
    })
    ->afterEach(function (): void {
        Monkey\tearDown();
        \Mockery::close();
    })
    ->in('unit', 'integration');

pest()
    ->extends(WpTestCase::class)
    ->in('functional');
