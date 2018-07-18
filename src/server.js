'use strict';

const chalk = require('chalk');
const glue = require('glue');
const manifest = require('./manifest.js');

const options = {
    relativeTo: __dirname,
};

const startServer = async function () {
    try {
        const server = await glue.compose(manifest, options);
        await server.start();

        /* eslint no-console: 0 */
        console.log(chalk.blueBright(`Server running at: ${server.info.uri}`));
    }
    catch (err) {
        console.log(err)
        process.exit(1);
    }
};

startServer();
