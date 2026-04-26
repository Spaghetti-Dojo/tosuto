/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    docs: [
        'index',
        {
            type: 'category',
            label: 'Server',
            items: [ 'server/php-api' ],
        },
        {
            type: 'category',
            label: 'Client',
            items: [ 'client/js-api' ],
        },
    ],
};

export default sidebars;
