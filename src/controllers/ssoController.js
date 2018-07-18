'use strict';

const saml = require('samlify');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const config = require('config');

const libsaml = saml.SamlLib;
const ServiceProvider = saml.ServiceProvider;
const IdentityProvider = saml.IdentityProvider;

//DEV
//STAGING
//PROD
const env = config.environment.ENV ? config.environment.ENV.toLowerCase() : '';

module.exports = class SSOController {

    constructor(server) {
        this.server = server;
    }

    async runCreateLoginResponse(request) {

        const response = {
            samlResponse: null,
            entityEndpoint: null,
            type: null,
            errors: []
        };

        request.app = request.app ? request.app.trim().toLowerCase() : ''

        if (!request.app || (request.app != 'questis' && request.app != 'everfi' && request.app != 'relius' && request.app != 'tcg_services')) {
            response.errors.push('bad request');
            return response;
        }

        let attributes = [];

        switch (request.app) {
            case 'questis':
                {
                    attributes = [
                        { name: "email", valueTag: "userEmail", nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic", valueXsiType: "xs:string" },
                        { name: "last_name", valueTag: "userLastName", nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic", valueXsiType: "xs:string" },
                        { name: "first_name", valueTag: "userFirstName", nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic", valueXsiType: "xs:string" },
                        { name: "plan_id", valueTag: "userPlanId", nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic", valueXsiType: "xs:string" }

                    ];
                }
        }

        const reqInfo = { extract: { authnrequest: { id: uuidv4() } } };

        const defaultIdpConfig = {
            isAssertionEncrypted: true,
            metadata: fs.readFileSync(`./src/saml_config/metadata/${env.toLowerCase()}/metadata_idp.xml`),
            privateKey: fs.readFileSync(`./src/saml_config/key/idp/${env.toLowerCase()}/privatekey_idp.pem`),
            encPrivateKey: fs.readFileSync(`./src/saml_config/key/idp/${env.toLowerCase()}/encrypyKey_${request.app}_idp.pem`),
            loginResponseTemplate: {
                context: fs.readFileSync(`./src/saml_config/template/loginResponseTemplate_${request.app}.xml`).toString(),
                attributes: attributes
            }
        };

        const defaultSpConfig = {
            metadata: fs.readFileSync(`./src/saml_config/metadata/${env}/metadata_${request.app}_sp.xml`)
        };

        const idp = IdentityProvider(defaultIdpConfig);
        const sp = ServiceProvider(defaultSpConfig);

        const options = {
            destination: config.environment.SSO[request.app.toUpperCase()].DESTINATION,
            subjectRecipient: config.environment.SSO[request.app.toUpperCase()].SUBJECTRECIPIENT,
            attributes: request.userAttributes
        };

        const { userData } = request;

        const loginResponse = await idp.createLoginResponse(sp, reqInfo, 'post', userData, createTemplateCallback(idp, sp, options), true);

        response.samlResponse = loginResponse.context;
        response.entityEndpoint = loginResponse.entityEndpoint;
        response.type = loginResponse.type;

        return response;
    }
}

const createTemplateCallback = (idp, sp, options) => template => {

    const _id = `_${uuidv4()}`.toString().replace(/[-]/g, "");
    const now = new Date();
    const spEntityID = sp.entityMeta.getEntityID();
    const expirationDate = new Date(now.getTime());

    expirationDate.setMinutes(expirationDate.getMinutes() + 5);

    let tvalue = {
        ID: _id,
        AssertionID: `_${uuidv4()}`.replace(/[-]/g, ""),
        Destination: options.destination,
        Audience: spEntityID,
        SubjectRecipient: options.subjectRecipient,
        Issuer: idp.entityMeta.getEntityID(),
        IssueInstant: now.toISOString(),
        ConditionsNotBefore: now.toISOString(),
        ConditionsNotOnOrAfter: expirationDate.toISOString(),
        SubjectConfirmationDataNotOnOrAfter: expirationDate.toISOString(),
        InResponseTo: 'nothing',
        StatusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
        AuthnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:Password'
    };

    tvalue = Object.assign({}, tvalue, options.attributes);

    return {
        id: _id,
        context: libsaml.replaceTagsByValue(template, tvalue),
    };
};