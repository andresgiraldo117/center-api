const jwt = require('jsonwebtoken');
const config = require('./config');

const getToken = (payload) =>{
    return jwt.sign({
        data: payload
    }, config.SECRET_CONFIRM_EMAIL, { expiresIn: '24h'});
}

const getTokenData = (token) => {
    let data = null;
    jwt.verify(token, config.SECRET_CONFIRM_EMAIL, (err, decoded) => {
        if(err)return err;
        else data = decoded;
    })
    return data;
}

const verifyTokenForgotPassword = (token) => {
    return jwt.sign({
        data: payload
    }, config.SECRET_CONFIRM_EMAIL, { expiresIn: '24h'});
}

module.exports = {
    getToken,
    getTokenData,
    verifyTokenForgotPassword
}