const Permissions = require('../models/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const Boom = require('@hapi/boom');
const { returnDataOrError } = require('../middlewares/Response');

class ClassPermission {

    static async create(user, data){
        if(await validatePermission(user, typePermissions.Permission.createPermission)){
            const newPermission = new Permissions(data);
            await newPermission.save();
            return returnDataOrError({}, null, `creado con exito`);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Permission.getAllPermissions)){
            let permissions = await Permissions.find();
            if(permissions.length === 0) return returnDataOrError({}, null, `No hay permisos`);
            return returnDataOrError(permissions, null, ``);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    };

    static async addPermission(user, id, data){
        if(await validatePermission(user, typePermissions.Permission.createPermission)){
            const idPermission = await Permissions.findById(id);
            if(!idPermission) return returnDataOrError({}, null, `El ID no pertenece a ningun permiso`); 
            if(data.nameRole || data._id) return returnDataOrError({}, null, `No se puede actualizar este campo`);
            if(!data.action || !data.status) return returnDataOrError({}, null, `Falta algun campo`);

            let permission = await Permissions.findByIdAndUpdate(id, {
                $addToSet: { listPermissions: data }
            }, {new: true});
            return returnDataOrError(permission, null, `Se creo el permiso con exito`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        
    };

    static async update(user, id, data){
        if(await validatePermission(user, typePermissions.Permission.updatePermissions)){
            const idPermission = await Permissions.findById(id);
            if(!idPermission) return returnDataOrError({}, null, `El ID no pertenece a ningun permiso`);
            if(data.nameRole || data._id) return returnDataOrError({}, null, `No se puede actualizar este campo`);
            if(data.changeState){
                const query = { _id: id, "listPermissions.action": data.action };
                const updateDocument = {
                    $set: { "listPermissions.$.status": data.changeState}
                };
                const result = await Permissions.updateOne(query, updateDocument);
                return returnDataOrError({}, null, `Se actualizo el permiso con exito`);
            }
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        
    };

    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Permission.getAllPermissionsByID)){
            let permission = await Permissions.findById(id);
            if(permission) return returnDataOrError(permission, null, ``);
            return returnDataOrError({}, null, `No se encontro una permiso con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    };

    static async delete(user, id, data){
        if(await validatePermission(user, typePermissions.Permission.deletePermissions)){
            const response = await Permissions.updateOne({ _id: id }, 
                {$pull: {"listPermissions": { "action": data.action}}}
            );
            return returnDataOrError({}, null, `Se elimino el permiso con exito`);
            
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    };
};

module.exports = ClassPermission;