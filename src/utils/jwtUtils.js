const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = class JwtUtils {
    static createToken(data) {
        const jwtSecret = config.environment.JWTSECRET;
        const token = jwt.sign(data, jwtSecret, { expiresIn: config.environment.JWTEXPIRY });

        return token;
    }

    static validateToken(token) {
        const jwtSecret = config.environment.JWTSECRET;
        let isValid = true;

        jwt.verify(token, jwtSecret, (error, decode) => {
            isValid = !error ? true : false;
        });

        return isValid;
    }
}