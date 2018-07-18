'use strict';

const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserAttribute = AmazonCognitoIdentity.CognitoUserAttribute;
const config = require('config');

module.exports = class AwsUtils {

    static getCredentials() {
        AWS.config.credentials = new AWS.SharedIniFileCredentials();
        return AWS.config.credentials;
    }

    static getPoolData() {

        const poolData = {
            UserPoolId: config.environment.USERPOOLID,
            ClientId: config.environment.CLIENTID
        };

        return poolData;
    }

    static getAttibuteListForSignUp(userData) {
        let attributeList = [];

        attributeList.push(new CognitoUserAttribute({
            Name: 'email',
            Value: userData.workEmail
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'phone_number',
            Value: userData.mobilePhone
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'name',
            Value: `${userData.firsName} ${userData.lastName}`
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:tcg-application',
            Value: 'financial pathway'
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:first_name',
            Value: userData.firstName
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:last_name',
            Value: userData.lastName
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:ssn',
            Value: userData.ssn
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:dob',
            Value: userData.dob
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:personal_email',
            Value: userData.personalEmail
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:other_email',
            Value: userData.otherEmail
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:notification_type',
            Value: userData.notificationType
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:relius',
            Value: userData.relius.toString()
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:everfi',
            Value: userData.everfi.toString()
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:questis',
            Value: userData.questis.toString()
        }));

        attributeList.push(new CognitoUserAttribute({
            Name: 'custom:tcg_services',
            Value: userData.tcgService.toString()
        }));

        return attributeList;
    }

    static isObject(value) {
        return value && typeof value === 'object' && value.constructor === Object;
    }
}