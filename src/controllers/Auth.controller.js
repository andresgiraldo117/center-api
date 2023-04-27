const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ClassUsers = require('./Users.controller')
const Boom = require('@hapi/boom');
const ConfigurationAcc = require('../models/ConfigurationAccount');
const { returnDataOrError } = require('../middlewares/Response');
const { sendTokenForgotPassword, getToken } = require('../jwt.config');
const notificacionsSend = require('../templates/Notifications.template');


class ClassAuth {

    /**
     * Recibe los parametros por body y se hace la validación para el ingreso.
     * Si los datos ingresados son validos, se genera un token que se le asocia al usuario para la correcta navegación por la app.
     * El token tiene un tiempo limite de expiración de un día, despues de ese tiempo se debe volver a ingresar para obtener un nuevo token.
     * @param {string} email
     * @param {string} password
     * @returns 
     */
    static async login(email, password) {
        let accountFound = await User.findOne({ email });
        if(!accountFound) return returnDataOrError([], null, `No tiene acceso`); 
        
        const matchPassword = await User.comparePassword(password, accountFound.password);
        if(!matchPassword) return returnDataOrError([], null, `No tiene acceso`);

        const token = jwt.sign({id: accountFound._id}, config.SECRET, { 
            expiresIn: 86400 
        })  
        
        accountFound.password = undefined;
        let response = accountFound;
        response.token = token
        
        if(accountFound.statusTour === undefined){
            response.statusTour = false
        }
        await User.findOneAndUpdate({email:response.email}, {token: token});
        const confi = await ConfigurationAcc.aggregate([
            {
                $match: { id_account: response.id_account }
            },
            {
                $lookup: {
                    pipeline: [
                        {$project: {type_account: 0, country: 0, nit: 0, password: 0, document_type: 0, document_number: 0, profession: 0, city: 0, address: 0, phone: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                    ],
                    from: "accounts",
                    localField: "id_account",
                    foreignField: "_id",
                    as: "account"
                }
            },
            {
                $project: { id_account: 0, createdAt: 0, updatedAt:0 ,}
            }
        ]);
        const user = {
            ...response._doc,
            configuration: confi[0]
        }

        if(user.status !== 'active'){
            return returnDataOrError([], null, `Debe confirmar su cuenta antes de iniciar sesión`);
        }
        return returnDataOrError(user, null, ``);
    }

    /**
     * Cualquier persona usuario puede crear una cuenta.
     * La información de la cuenta se debe ingresar por body.
     * La cuenta creada quedará desabilidata y no se podra ingresar, hasta que un administrador valide la cuenta. 
     * @param {number} nit
     * @param {string} name 
     * @param {string} email 
     * @param {string} city 
     * @param {string} country 
     * @param {string} address 
     * @param {number} phone 
     * @param {string} url  
     * @returns
     */
    static async SignUp(data){
        
        // let accountFound = await Accounts.find({ email: data.email})
        // if(accountFound.length === 1) throw Boom.notAcceptable(`La cuenta: ${data.name} ya existe`);
        // await ClassAccounts.create( data );
        // return { message: 'La cuenta se creo con exito y será activada lo más pronto posible', status: 200 };

        const user = await User.find({ email: data.email });
    }

    static async forgotPassword(email){
        const user = await User.find({ email });
        
        if(user.length === 0) return returnDataOrError([], null, `Verifique su correo electronico.`);

        const data = {
            id: user[0]._id,
            email: user[0].email
        };

        //Send Email        
        
        const sendToken = getToken(data);
        // await notificacionsSend.changePassword(sendToken);

        const verifyToken = `http://localhost:3001/new-password/${sendToken}`

        return returnDataOrError([], null, `Si su email es valido, le llegara el enlace de recuperación.`) 
    }

    static async changePassword ({password, token}) {
        const changeP = await ClassUsers.changePassword({password, token})
        return changeP;
    }
}
module.exports = ClassAuth
