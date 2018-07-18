'use strict';

const config = require('config');

module.exports = {
    server: {
        port: 8000,
        routes: {
            cors: {
                origin: [`${config.environment.ALLOWORIGIN}`]
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: './loggers/errorLogger'
            },
            {
                plugin: './routes/auth/authRoute'
            },
            {
                plugin: './routes/ssoRoute'
            }
        ],
        options: {
            once: true
        }
    }
};
