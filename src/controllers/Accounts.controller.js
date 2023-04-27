const Accounts = require('../models/Accounts');
const Users = require('../models/User');
const ClassConfigurationAccount = require('./ConfigurationAcc.controller');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const { AccountServices } = require('../services/Account.services');
var ObjectId = require('mongoose').Types.ObjectId; 
const { getToken, getTokenData } = require('../jwt.config');
const notificacionsSend = require('../templates/Notifications.template');
const { returnDataOrError } = require('../middlewares/Response');

class ClassAccounts {
    constructor(id){
        this.id = id;
    };
    

    /**
     * Se deben ingresar estos parametro para poder crear una cuenta, toda la información se recibirá por body. 
     * Al momento de la creación de la cuenta, queda registrada, pero, quedara desabilidad hasta que confirme su email.
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

    static async create(data) {  
        let finduser;
        
        finduser = await Users.findOne({email: data.email})
        if(finduser){
            return returnDataOrError([], null, 'La cuenta ya exixte');
        }

        const newAccount = new Accounts({
            ...data,
            password: await Accounts.encryptPassword(data.password),
        });
        newAccount.type_account === 'company' ? newAccount : newAccount.role = 'admin_account';  
        newAccount.url = `disable-${newAccount.url}`;
        const configuration = await ClassConfigurationAccount.create(newAccount.id);
        newAccount.configuration = configuration.response._id;
        await newAccount.save();    
        
        let newUser = {
            ...newAccount._doc,
            role: 'admin_account',
            id_account: newAccount._id
        }
        
        const user = new Users(newUser);
        
        const nuser = await user.save();  

        const {email, _id } = nuser;

        newAccount.id_users = newUser._id;
        const saveAccount = await newAccount.save();

        //generar token
        const token = getToken( {email, _id} );

        //Send Email
        await notificacionsSend.emailToken(user, token);

        if(saveAccount){
            return returnDataOrError([], null, 'Se a creado la cuenta con exito, verifique su email para confirmar.');
        }
        return returnDataOrError([], null, 'Ocurrio un error al crear.');
    };

    /**
     * Para devolver la información se hace la petición validando un usuario registrado en la base de datos. 
     * @param {object} user  
     * @returns 
     */
    static async getAll(user){
        if(await validatePermission(user, typePermissions.Account.getAllAccounts)){
            const accounts = await Accounts.aggregate(
                [    
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_users",
                            foreignField: "_id",
                            as: "users"
                        }
                    },        
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0,  id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "boards",
                            localField: "id_boards",
                            foreignField: "_id",
                            as: "boards"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { createdAt:0, updatedAt:0 }},
                            ],
                            from: "configuration_accounts",
                            localField: "configuration",
                            foreignField: "_id",
                            as: "configuration"
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {$project: { password: 0, id_users: 0,  id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                ]
            );
            
            if(accounts.length > 0){
                return returnDataOrError(accounts, null, '');
            }
            return returnDataOrError([], null, 'No hay cuentas registradas');
        }
        return returnDataOrError([], null, 'No tiene permisos para esta acción');
    };

    /**
     * Se debe recibir un id por params e instaciar la clase para obtener una cuenta.
     * @param {number} id
     * @returns 
    */
    async getById(user){
        if(await validatePermission(user, typePermissions.Account.getAllAccountsById)){
            const account = await Accounts.aggregate(
                [   
                    { $match: { _id: ObjectId(this.id) }},     
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_users",
                            foreignField: "_id",
                            as: "users"
                        }
                    },       
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "boards",
                            localField: "id_boards",
                            foreignField: "_id",
                            as: "boards"
                        }
                    },
                    {
                        $lookup: {
                            from: "configuration_accounts",
                            localField: "configuration",
                            foreignField: "_id",
                            as: "configuration"
                        }
                    },
                    {$project: { password: 0, id_users: 0, id_boards: 0, createdAt:0, updatedAt:0 }},
                ]
            );

            if(account.length > 0){
                return returnDataOrError(account, null, '');
            }  
            return returnDataOrError([], null, `No hay una cuenta registrada con el ID: ${this.id}`);
        }
        return returnDataOrError([], null, 'No tiene permisos para esta acción');
    };

    /**
     * Se valida que el usuario que quiera actualizar la información de una cuenta, sea un owner.
     * Recibe el Id de la cuenta por params.
     * Dependiendo de la información que se va a actualizar se hace una validación para actualizar los atributos correctamente. 
     * @param {object} user
     * @param {number} id 
     * @param {string} data 
     * @returns 
     */
    static async update (user, id, data) {
        if(await validatePermission(user, typePermissions.Account.updateAccount)){
            if(data.id_boards){
                const account = await Accounts.findByIdAndUpdate(id, 
                    {
                        $addToSet: {id_boards: data.id_boards}
                    }, 
                    {new: true}
                );
                if(account) return returnDataOrError([], null, `Se actualizo satisfactoriamente`); 
                return returnDataOrError([], null, `No se encontro una cuenta con el ID: ${id}`);
            }

            const account = await Accounts.findByIdAndUpdate(id, data, {new: true});
            if(account) return returnDataOrError([], null, `Se actualizo satisfactoriamente`);  

            return returnDataOrError([], null, `No se encontro una cuenta con el ID: ${id}`);
        }
        return returnDataOrError([], null, `No puede realizar esta acción`);
    };

    /**
     * Se valida que el usuario sea un owner para eliminar una cuenta.
     * Se obtiene el Id de la cuenta a eliminar por params. 
     * @param {object} user
     * @param {number} id   
     * @returns 
     */
    static async delete ( user, id ) {
        if(await validatePermission(user, typePermissions.Account.deleteAccount)){
            const account = await Accounts.findByIdAndDelete(id);
            if(!account){
                return returnDataOrError([], null, `No se encontro una cuenta con el ID: ${id}`);
            }
            if(account){
                const config = await ClassConfigurationAccount.delete(account._id);
                return returnDataOrError({account, config}, null, ``);
            };
        }
        return returnDataOrError([], null, `No puede realizar esta acción`);
    }
}

module.exports = ClassAccounts;
