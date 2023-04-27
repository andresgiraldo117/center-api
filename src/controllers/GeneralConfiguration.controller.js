const GeneralConfig = require('../models/GeneralConfiguration');
let ObjectId = require('mongoose').Types.ObjectId;
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { returnDataOrError } = require('../middlewares/Response');

class ClassGeneralConfiguration {

    // static async create(data) {
    //     const newGConfig = new GeneralConfig(data);
    //     const savedGConfig = await newGConfig.save();
    //     if(savedGConfig) return returnDataOrError(savedGConfig, null, ``);
    //     return returnDataOrError({}, null, `No se pudo crear.`);
    // }

    static async getAll(user){
        if(await validatePermission(user, typePermissions.GeneralConfiguration.getAllGConfig)){
            const config = await GeneralConfig.find();  
            if (config.length == 0) return returnDataOrError({}, null, `No hay configuraciones registrados`);
            return returnDataOrError(config, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    static async getById(user, id){
        // if( await validatePermission(user, typePermissions.GeneralConfiguration.getAllById)){
            const config = await GeneralConfig.findById(id);
            if(config.length > 0) return returnDataOrError(config, null, ``);
            return returnDataOrError({}, null, `No se encontro un configuración con el ID ${id}`);
        // }
        
        // return returnDataOrError({}, null, `No puede realizar esta acción`);
    }

    static async update(user, id, data){
        if(await validatePermission(user, typePermissions.GeneralConfiguration.updateGConfig)){
            const config = await GeneralConfig.findByIdAndUpdate("636bc3be8c20892e3d687cf0", data, {new: true});
            if(config) return returnDataOrError(config, null, ``);
            return returnDataOrError({}, null, `No se encontro un configuración con el ID ${id}`);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }
}

module.exports = ClassGeneralConfiguration;

