'use strict';

const boom = require('boom');
const AuthBearer = require('hapi-auth-bearer-token');

const AuthController = require('../../controllers/authController');
const JwtUtils = require('../../utils/jwtUtils');
const JoiSchema = require('../../utils/joiSchemaUtils');

const controller = new AuthController();

const registerHandler = request => {
    try {
        const registerData = controller.runRegister(request.payload);

        if (!registerData.isValid) {
            return boom.unauthorized('unauthorized');
        }

        return registerData;

    } catch (error) {
        return boom.badImplementation('error occured - please refer to systems administrator');
    }
}

const completeProfileHandler = async request => {
    try {
        return await controller.runCompleteProfile(request.payload);
    } catch (error) {
        return boom.badImplementation('error occured - please refer to systems administrator');
    }
};

const confirmRegistrationHandler = async request => {
    try {
        return await controller.runConfirmRegistration(request.payload);
    } catch (error) {
        return boom.badImplementation('error occured - please refer to systems administrator');
    }
}

const loginHandler = async (request) => {
    try {
        const response = await controller.runLogin(request.payload);

        if (response.errors.length > 0) {
            return boom.unauthorized('unauthorized');
        }

        return response;

    } catch (error) {
        return boom.badImplementation('error occured - please refer to systems administrator');
    }
};

exports.plugin = {
    register: async (server) => {
        this.server = server;

        await server.register(AuthBearer);

        server.auth.strategy('simple', 'bearer-access-token', {
            validate: async (request, token, h) => {

                const isValid = JwtUtils.validateToken(token);
                const credentials = { token };

                return { isValid, credentials };
            }
        });

        server.auth.default('simple');

        server.route({
            method: 'POST',
            path: '/auth/register',
            config: {
                auth: false,
                validate: {
                    payload: JoiSchema.registerSchema
                }
            },
            handler: registerHandler
        });

        server.route({
            method: 'POST',
            path: '/auth/completeprofile',
            config: {
                validate: {
                    payload: JoiSchema.completeProfileSchema
                }
            },
            handler: completeProfileHandler
        });

        server.route({
            method: 'POST',
            path: '/auth/confirm',
            config: {
                auth: false,
                validate: {
                    payload: JoiSchema.confirmSchema
                }
            },
            handler: confirmRegistrationHandler
        });

        server.route({
            method: 'POST',
            path: '/auth/login',
            config: {
                auth: false,
                validate: {
                    payload: JoiSchema.loginSchema
                }
            },
            handler: loginHandler
        });
    },
    name: 'register',
    version: '1.0.0'
};
