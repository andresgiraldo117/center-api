const Format = require('../models/Format');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const { returnDataOrError } = require('../middlewares/Response');
    
class ClassFormat {
    
    static async create(data){
        if(await validatePermission(user, typePermissions.Formats.createFormat)){
            data.image = './FormatPauta/facebook-icon.png';
            const newFormat = new Format(data);
            const savedFormat = await newFormat.save();
            return returnDataOrError(savedFormat, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }

    static async getAllFormats(user){
        if(await validatePermission(user, typePermissions.Formats.getAllFormats)){
            const format = await Format.find(); 
            if(format.length > 0) return returnDataOrError(format, null, ``);
            return returnDataOrError({}, null, `No hay formatos registrados`);  
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    };
    
    static async getById(user, idFormat){
        if(await validatePermission(user, typePermissions.Formats.getAllFormatsById)){
            const format = await Format.findById(idFormat); 
            if(format) return returnDataOrError(format, null, ``);
            return returnDataOrError({}, null, `No hay un formato registrado con ese Id`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    };

    static async update(user, idFormat, data){
        if(await validatePermission(user, typePermissions.Formats.updateFormat)){
            const format = await Format.findByIdAndUpdate(idFormat, data, {new: true});
            if(format) return returnDataOrError(format, null, ``);
            return returnDataOrError({}, null, `No se encontro el formato con el id: ${id}`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }

    static async delete(user, id){
        if(await validatePermission(user, typePermissions.Formats.deleteFormat)){
            const format = await Format.findByIdAndDelete(id);
            if(format) return returnDataOrError(format, null, `Se eliminó el formato`);
            return returnDataOrError({}, null, `No se encontro un formato con ese Id.`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }
}

module.exports = ClassFormat;
