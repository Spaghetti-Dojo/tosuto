// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'WP Tosuto',
    tagline: 'Programmatic toast notifications for WordPress',

    url: 'https://spaghetti-dojo.github.io',
    baseUrl: '/tosuto/',

    organizationName: 'Spaghetti-Dojo',
    projectName: 'tosuto',

    future: {
        faster: true,
        v4: true,
    },

    onBrokenLinks: 'throw',
    markdown: {
        hooks: {
            onBrokenMarkdownLinks: 'warn',
        },
    },

    i18n: {
        defaultLocale: 'en',
        locales: [ 'en' ],
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ( {
                docs: {
                    routeBasePath: '/',
                    path: '../docs',
                    sidebarPath: './sidebars.js',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
            } ),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ( {
            colorMode: {
            defaultMode: 'dark',
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        navbar: {
                title: 'WP Tosuto',
                items: [
                    {
                        href: 'https://github.com/Spaghetti-Dojo/tosuto',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'API',
                        items: [
                            { label: 'PHP API', to: '/server/php-api' },
                            { label: 'JavaScript API', to: '/client/js-api' },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'GitHub',
                                href: 'https://github.com/Spaghetti-Dojo/tosuto',
                            },
                            {
                                label: 'Issues',
                                href: 'https://github.com/Spaghetti-Dojo/tosuto/issues',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${ new Date().getFullYear() } Spaghetti Dojo. Built with Docusaurus.`,
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
                additionalLanguages: [ 'php' ],
            },
        } ),
};

export default config;
