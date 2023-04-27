const jwt = require('jsonwebtoken');
const config =  require('../config');
const User = require('../controllers/Users.controller');

const verifyToken = async(req, res, next) => {
    try {
        const token = req.headers['token'];
        if(!token) {
            throw Error('Token no enviado')
        };
        const decoded = jwt.verify(token, config.SECRET );
        req.accountId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "No Authorized token",
        });
    }
}

const apikey = async(req, res, next) => {
    try {
        const apikey = req.header("apikey");
        if (apikey == null) throw Error()
        if(apikey != Buffer.from(config.APIKEY).toString('base64')) throw Error('Invalid ApiKey')
        // if(apikey != config.APIKEY) return res.status(500).send({message: "Invalid ApiKey"});
        next();
    } catch (error) {
        return res.status(401).json({
            message: "No Authorized apikey",
        });
    }
}

const isUser = async(req, res, next) => {
    try {
        let user = await User.getByToken(req.header('token'));
        if(!user){
            throw Error( `No tiene autorizacion`)
        }
        req.user = user
        next();
        
    } catch (error) {
        return res.status(401).json({
            message: "No Authorized user"
        });
    }
}

const isAdmin = async(req, res, next) => {
    let user = await User.getByToken(req.header('token'));
    if(user.role == 'seller') return res.status(401).json({
        message: "No Authorized"
    });
    req.user = user
    next();
}



module.exports = {
    verifyToken, 
    apikey,
    isAdmin,
    isUser
}