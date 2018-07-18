'use strict';

const boom = require('boom');
const SSOController = require('../controllers/ssoController');

const controller = new SSOController();

const createLoginResponseHandler = async request => {

    try {
        const response = controller.runCreateLoginResponse(request.payload);
        return response;
    } catch (error) {
        return boom.badImplementation('error occured - please refer to systems administrator');
    }
}

exports.plugin = {
    register: async (server) => {
        this.server = server;

        server.route({
            method: 'POST',
            path: '/sso/loginrequest',
            config: {
                auth: false
            },
            handler: createLoginResponseHandler
        });
    },
    name: 'sso',
    version: '1.0.0'
};
