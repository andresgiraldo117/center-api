const Files = require('../models/Files');
const Accounts = require('../models/Accounts');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const Boom = require('@hapi/boom');
const { returnDataOrError } = require('../middlewares/Response');
var ObjectId = require('mongoose').Types.ObjectId; 

class ClassFiles {
    
    static async create(data) {  
        const newFile = new Files(data);
        const save = await newFile.save();
        if(save){
            return returnDataOrError({}, null, `Se creó el archivo con exito.`);
        }
        return returnDataOrError({}, null, `Ocurrio un error al crear.`);
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Files.getAllFiles)){
            const files = await Files.aggregate([
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
                { $unwind: '$account' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {password: 0, address: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                        ],
                        from: "formats",
                        localField: "id_format",
                        foreignField: "_id",
                        as: "format"
                    }
                },
                { $unwind: '$format' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "campaigns",
                        localField: "id_campaign",
                        foreignField: "_id",
                        as: "campaign"
                    }
                },
                { $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true } },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { id_users: 0, id_boards: 0, id_account: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_format: 0,id_campaign: 0,id_account: 0, id_board: 0, createdAt: 0, updatedAt: 0}
                }
            ]);
            
            if(files.length == 0) return returnDataOrError({}, null, `No hay archivos`);
            return returnDataOrError(files, null, ``);
        }
        if(await validatePermission(user, typePermissions.Files.getAllMyFiles)){
            const files = await Files.aggregate([
                { 
                    $match: { id_account: user.id_account }
                },
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
                { $unwind: '$account' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {password: 0, address: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                        ],
                        from: "formats",
                        localField: "id_format",
                        foreignField: "_id",
                        as: "format"
                    }
                },
                { $unwind: '$format' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "campaigns",
                        localField: "id_campaign",
                        foreignField: "_id",
                        as: "campaign"
                    }
                },
                { $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true } },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { id_users: 0, id_boards: 0, id_account: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_format: 0,id_campaign: 0,id_account: 0, id_board: 0, createdAt: 0, updatedAt: 0}
                }
            ]);
            if(files.length == 0) return returnDataOrError({}, null, `No hay archivos.`); 
            return returnDataOrError(files, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    };

    static async getAllById(user, idFile){
        if(await validatePermission(user, typePermissions.Files.getAllFilesById)){
            const file = await Files.aggregate([
                {
                    $match: { _id: ObjectId(idFile)}
                },
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
                { $unwind: '$account' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {password: 0, address: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                        ],
                        from: "formats",
                        localField: "id_format",
                        foreignField: "_id",
                        as: "format"
                    }
                },
                { $unwind: '$format' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "campaigns",
                        localField: "id_campaign",
                        foreignField: "_id",
                        as: "campaign"
                    }
                },
                { $unwind: '$campaign' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { id_users: 0, id_boards: 0, id_account: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_format: 0,id_campaign: 0,id_account: 0, id_board: 0, createdAt: 0, updatedAt: 0}
                }
            ]);
            
            if(file.length == 0) return returnDataOrError({}, null, `No hay archivos`);
            return returnDataOrError(file, null, ``);
        }
        if(await validatePermission(user, typePermissions.Files.getAllMyFilesById)){
            const files = await Files.aggregate([
                {
                    $match: { _id: ObjectId(idFile)}
                },
                { 
                    $match: { id_account: user.id_account }
                },
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
                { $unwind: '$account' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {password: 0, address: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt: 0, updatedAt: 0, token: 0}},
                        ],
                        from: "formats",
                        localField: "id_format",
                        foreignField: "_id",
                        as: "format"
                    }
                },
                { $unwind: '$format' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "campaigns",
                        localField: "id_campaign",
                        foreignField: "_id",
                        as: "campaign"
                    }
                },
                { $unwind: '$campaign' },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { id_users: 0, id_boards: 0, id_account: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "boards",
                        localField: "id_board",
                        foreignField: "_id",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_format: 0,id_campaign: 0,id_account: 0, id_board: 0, createdAt: 0, updatedAt: 0}
                }
            ]);
            if(files.length == 0) return returnDataOrError({}, null, `No hay archivos.`); 
            return returnDataOrError(files, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    };

    static async getAllFilesByCampaign(id){
        const files = await Files.aggregate([
            {
                $match: { id_campaign: id}
            },
            {
                $project: { id_format: 0, id_account: 0, id_board: 0, createdAt: 0, updatedAt: 0}
            }
        ])
        return returnDataOrError(files, null, ``);
    }

    static async deleteAll(user){
        if(await validatePermission(user, typePermissions.Files.deleteAllFiles)){
            const files = await Files.deleteMany({});
            return returnDataOrError(files, null, `Se eliminarón todos los archivos.`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }

    static async deleteById(user, idFile){
        if(await validatePermission(user, typePermissions.Files.deleteFilesById)){
            const file = await Files.findByIdAndDelete(idFile);
            if(file) return returnDataOrError(file, null, `Se eliminó el archivo.`);
            return returnDataOrError({}, null, `No se encontro un archivo con ese Id.`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    } 
}

module.exports = ClassFiles;
