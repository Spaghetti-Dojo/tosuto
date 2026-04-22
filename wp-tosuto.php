<?php

/**
 * Plugin Name: WP Tosuto
 * Description: Renders toast notifications via the Interactivity API, inspired by shadcn/ui.
 * Version: 0.1.0
 * Requires at least: 6.9
 * Requires PHP: 8.4
 * Text Domain: wp-tosuto
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package SpaghettiDojo\Tosuto
 */

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto;

use Inpsyde\Modularity\Package;
use Inpsyde\Modularity\Properties\PluginProperties;

defined('ABSPATH') || exit;

require_once __DIR__ . '/vendor/autoload.php';

add_action(
    'plugins_loaded',
    static function (): void {
        Package::new(PluginProperties::new(__FILE__))
            ->addModule(Toaster\Module::new())
            ->addModule(Api\Module::new())
            ->boot();
    }
);
