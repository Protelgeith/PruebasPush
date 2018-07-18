const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);

module.exports = {
    registerSchema: {
        employeer: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        snn: Joi.number().required(),
        dob: Joi.date().format('MM/DD/YYYY').raw()
    },
    completeProfileSchema: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        snn: Joi.number().required(),
        dob: Joi.date().format('MM/DD/YYYY').raw(),
        workEmail: Joi.string().email().required(),
        personalEmail: Joi.string().optional().allow('').email(),
        otherEmail: Joi.string().optional().allow('').email(),
        mobilePhone: Joi.string().required().regex(/^\+?( *\d){11,11} *$/),
        notificationType: Joi.string(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().min(8).required().valid(Joi.ref('password')),
        relius: Joi.boolean().required(),
        everfi: Joi.boolean().required(),
        questis: Joi.boolean().required(),
        tcgService: Joi.boolean().required()
    },
    confirmSchema: {
        email: Joi.string().required().email(),
        verificationCode: Joi.string().required()
    },
    loginSchema: {
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }
}