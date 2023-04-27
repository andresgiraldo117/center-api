const Landing = require('../models/Landing');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
var ObjectId = require('mongoose').Types.ObjectId; 
const { returnDataOrError } = require('../middlewares/Response');

class ClassLanding  {
    
    static async create(data) {  
        const newLanding = new Landing(data);
        await newLanding.save();

        if(newLanding){
            return returnDataOrError([], null, 'Se a creado la cuenta con exito.');
        }
        return returnDataOrError([], null, 'Ocurrio un error al crear.');
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Landing.getAllLandings)){
            const landings = await Landing.aggregate([
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_account: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
            ])
            
            if(landings.length > 0){
                return returnDataOrError(landings, null, '');
            }
            return returnDataOrError([], null, 'No hay cuentas registradas');
        }
        return returnDataOrError([], null, 'No tiene permisos para esta acción');
    };

    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Landing.getAllLandingsById)){
            const landing = await Landing.aggregate([
                { $match: { id_board: ObjectId(id) }},
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_account: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
            ]);

            if(landing) return returnDataOrError(landing, null, '');
            return returnDataOrError([], null, `No hay una cuenta registrada con el ID: ${id}`);
        }

        return returnDataOrError([], null, 'No tiene permisos para esta acción');
    };

    static async update (user, id, data) {
        if(await validatePermission(user, typePermissions.Landing.updateLanding)){
            if(data.id_board) return returnDataOrError([], null, 'No puede actualizar este campo');

            const landing = await Landing.findByIdAndUpdate(id, data, {new: true});
            if(landing) return returnDataOrError([], null, `Se actualizo satisfactoriamente`);  

            return returnDataOrError([], null, `No se encontro una Lnading con el ID: ${id}`);
        }
        return returnDataOrError([], null, `No puede realizar esta acción`);
    };

}

module.exports = { ClassLanding };
