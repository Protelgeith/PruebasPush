'use strict';

global.fetch = require('node-fetch');

const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AwsUtils = require('../utils/awsUtils');
const JwtUtils = require('../utils/jwtUtils');

const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUser = AmazonCognitoIdentity.CognitoUser;

const awsCredentials = AwsUtils.getCredentials();
AWS.config.credentials = awsCredentials;

module.exports = class AuthController {
    constructor(server) {
        this.server = server;
    }

    runRegister(request) {

        let response = {
            isValid: false,
            token: null,
            userData: {
                employeer: null,
                fullName: null,
                firstName: null,
                lastName: null,
                ssn: null,
                dob: null
            },
            userPermissions: {
                relius: false,
                everfi: false,
                questis: false,
                tcgService: false
            },
            errors: []
        };

        //TODO connect to aws database to validate user and employeer
        const validRequest = true;

        //this info should be delivered by the database
        const userFromDb = {
            userId: '1111-2222-3333-5',
            workEmail: 'santiago2@supernaut.io'
        }

        if (validRequest === true) {

            const tokenData = {
                id: userFromDb.userId,
                firstName: request.firstName,
                lastName: request.lastName,
                workEmail: userFromDb.workEmail
            };

            response.isValid = true;
            response.token = JwtUtils.createToken(tokenData);

            response.userData.employeer = request.employeer;
            response.userData.fullName = `${request.firstName} ${request.lastName}`;
            response.userData.firstName = request.firstName;
            response.userData.lastName = request.lastName;
            response.userData.ssn = request.snn;
            response.userData.dob = request.dob;
            response.userData.workEmail = userFromDb.workEmail;

            //these values should be delivered by the database
            response.userPermissions.relius = false;
            response.userPermissions.everfi = false;
            response.userPermissions.questis = true;
            response.userPermissions.tcgService = true;
        } else {
            response.errors.push("Invalid request.");
        }

        return response;
    }

    runCompleteProfile(userData) {

        const promise = new Promise((resolve) => {

            const poolData = AwsUtils.getPoolData();
            const userPool = new CognitoUserPool(poolData);
            const attributeList = AwsUtils.getAttibuteListForSignUp(userData);

            userPool.signUp(userData.workEmail, userData.password, attributeList, null, (error, result) => {
                const response = {
                    username: null,
                    errors: []
                };

                if (error) {
                    if (AwsUtils.isObject(error) && error.hasOwnProperty('message')) {
                        response.errors.push(error.message);
                    }

                    resolve(response);
                    return;
                }

                response.username = result.user.username;
                resolve(response);
            });
        });

        return promise;
    }

    runConfirmRegistration(userData) {
        const promise = new Promise((resolve) => {
            const poolData = AwsUtils.getPoolData();
            const userPool = new CognitoUserPool(poolData);

            const cognitoUser = new CognitoUser({
                Username: userData.email,
                Pool: userPool
            });

            cognitoUser.confirmRegistration(userData.verificationCode, true, (error, result) => {
                const response = {
                    verified: false,
                    errors: []
                };

                if (AwsUtils.isObject(error) && error.hasOwnProperty('message')) {
                    response.errors.push(error.message);
                }

                if (result === 'SUCCESS') {
                    response.verified = true;
                    cognitoUser.signOut();
                }

                resolve(response);
            });
        });

        return promise;
    }

    runLogin(userData) {

        const promise = new Promise((resolve, reject) => {
            const response = {
                userData: null,
                errors: []
            };

            const authenticationData = {
                Username: userData.user_name,
                Password: userData.password
            };

            const authenticationDetails = new AuthenticationDetails(authenticationData);
            const poolData = AwsUtils.getPoolData();
            const userPool = new CognitoUserPool(poolData);

            const cognitoUser = new CognitoUser({
                Username: userData.email,
                Pool: userPool
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: result => {

                    const { payload } = result.idToken;

                    response.userData = {
                        firstName: payload.first_name,
                        lastName: payload.last_name,
                        email: payload.email,
                        relius: payload['custom:relius'],
                        everfi: payload['custom:everfi'],
                        questis: payload['custom:questis'],
                        tcgServices: payload['custom:tcg_services'],
                        token: result.accessToken.jwtToken
                    };

                    resolve(response);
                },
                onFailure: function(error) {
                    response.userData = null;

                    if (AwsUtils.isObject(error) && error.hasOwnProperty('message')) {
                        response.errors.push(error.message);
                    } else {
                        response.errors.push(error);
                    }

                    resolve(response);
                },

            });
        });

        return promise;
    }
};