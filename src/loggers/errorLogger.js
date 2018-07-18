'use strict';

const config = require('config');
const winston = require('winston');
//const mongoWinston = require('winston-mongodb').MongoDB;

const configureLogger = () => {
    let options = {
        level: 'error',
        db: config.database.connection_string,
        collection: 'log',
        decolorize: false,
        includeIds: true
    };

    //winston.add(mongoWinston, options);
};

const registerEvent = (server) => {
    server.event('log-error');
    server.events.on('log-error', (eventData) => {
        logError(eventData);
    });
};

const logError = (errorData) => {
    winston.log('error', errorData);
};

exports.plugin = {
    register: async (server) => { //    options
        // configureLogger();
        // registerEvent(server);
    },
    name: 'error-logger',
    version: '1.0.0'
};
