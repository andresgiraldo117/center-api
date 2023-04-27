const ConfigurationAccount = require('../models/ConfigurationAccount');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const Boom = require('@hapi/boom');
const fs = require('fs');
const { returnDataOrError } = require('../middlewares/Response');
var ObjectId = require('mongoose').Types.ObjectId; 

class ClassConfigurationAccount {

    static async create(id) { 
        const configuration = {
            id_account: id,
        }
        const newConfiguration = new ConfigurationAccount(configuration);
        const createdConfiguration = await newConfiguration.save();
        if(createdConfiguration){
            return returnDataOrError(createdConfiguration, null, ``);
        }
        return returnDataOrError({}, null, `Ocurrio un error al crear la configuración.`);
        
    };

    static async getConfiguration(user){
        
        if(await validatePermission(user, typePermissions.ConfigurationA.getAllconfigurationsAccounts)){
            // owner
            const response = await ConfigurationAccount.aggregate([
                {
                    $lookup: {
                        pipeline: [
                            {$project: {type_account: 0, nit: 0, password: 0, document_type: 0, document_number: 0, profession: 0, city: 0, address: 0, phone: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                        ],
                        from: "accounts",
                        localField: "id_account",
                        foreignField: "_id",
                        as: "account"
                    }
                },
                { $sort : { createdAt : -1 } }
            ]);
            
            if(response.length > 0) return returnDataOrError(response, null, ``);
            return returnDataOrError({}, null, `No hay cuentas creadas`);
        }
        
        if(await validatePermission(user, typePermissions.ConfigurationA.getMyConfigurationAccount)){
            //admin_account
            const configuration = await ConfigurationAccount.aggregate([
                {
                    $match: { id_account : user.id_account }
                },{
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
                    $project: {id_account: 0, createdAt: 0, updatedAt: 0}
                }
            ]);

            if(configuration.length > 0) return returnDataOrError(configuration, null, ``);
            return returnDataOrError({}, null, `No hay configuración.`);
        }
        
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }

    static async getById(user, id){
        if(await validatePermission(user, typePermissions.ConfigurationA.getAllById)){

            const config = await ConfigurationAccount.aggregate(
                [     
                    {
                    $match: { _id: ObjectId(id)}
                },       
                {
                    $lookup: {
                        pipeline: [
                            {$project: { password: 0, nit: 0, email: 0, country: 0, address: 0, phone: 0, role: 0, id_users:0, id_boards: 0, configuration: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "accounts",
                        localField: "id_account",
                        foreignField: "_id",
                        as: "account"
                    }
                },
                {
                    $project: { id_account: 0, createdAt: 0, updatedAt: 0 }
                }
            ]);
            return returnDataOrError(config, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    static async update(user, data, files){
        if(await validatePermission(user, typePermissions.ConfigurationA.updateConfigurationById)){
            //Update owner

            if(!data.id_account) return returnDataOrError({}, null, `Debe enviar el Id de configuracion de la cuenta a actualizar`);

            data = await updateConfigurationAccount(user, data, files);
            await ConfigurationAccount.findOneAndUpdate({id_account: data.id_account}, data, {new: true} );
            return returnDataOrError({}, null, `Su configuración ha cambiado`);
        }

        if(await validatePermission(user, typePermissions.ConfigurationA.updateMyConfiguration)){
            //Update admin_account
            data = await updateConfigurationAccount(user, data, files);
            await ConfigurationAccount.findOneAndUpdate({id_account: user.id_account}, data, {new: true} );
            return returnDataOrError({}, null, `Su configuración ha cambiado`);
        }
        
        return returnDataOrError({}, null, `No tiene permisos para esta acción.`);
    }

    static async delete(user, id) {
        if(await validatePermission(user, typePermissions.ConfigurationA.deleteConfiguration)){

            const configuration = await ConfigurationAccount.deleteOne({ _id: id.id });

            if(configuration.deletedCount > 0){
                return returnDataOrError(configuration, null, `Se elimino la configuracion`);
            }
            return returnDataOrError({}, null, `No hay ninguna configuración con ese Id`);
            
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción.`);
    }

}

async function updateConfigurationAccount(user, data, files){
    if(files.length > 0){
        let newFile;
        for (const file of files) {
            fs.rename(`./Multimedia_Accounts/${file.filename}`, `./Multimedia_Accounts/${data.id_account? data.id_account : user.id_account}${file.originalname}_logo.${(file.mimetype).split('/')[1]}`, function(err) {
                if ( err ) {
                    console.log('ERROR: ' + err);
                }
            });
            newFile = {
                name: file.originalname,
                route: `/${data.id_account? data.id_account: user.id_account}${file.originalname}_logo.${(file.mimetype).split('/')[1]}`,
                extension: (file.mimetype).split('/')[1],
                size: file.size,
                id_account: `${data.id_account? data.id_account : user.id_account}`,
            } 
        }  
        data.logo = newFile.route; 
    }
    
    return data;
}

module.exports = ClassConfigurationAccount;
