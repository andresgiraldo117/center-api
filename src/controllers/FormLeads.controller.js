const FormLeads = require('../models/FormLeads');
const Leads = require('../models/Leads');
const Pautas = require('../models/Pauta');
const Users = require('../models/User');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
var ObjectId = require('mongoose').Types.ObjectId; 
const notificacionsSend = require('../templates/Notifications.template');
const { returnDataOrError } = require('../middlewares/Response');
const Boards = require('../models/Boards');

class ClassFormLeads {

    static async create(data) {  
        const newForm = new FormLeads(data);
        if(data.id_pauta){
            const pauta = await Pautas.findById(data.id_pauta);
            data.id_pauta = pauta._id;
            data.id_board = pauta.id_board;
        }
        const board = await Boards.findById(data.id_board);
        data.id_account = board.id_account;

        if(newForm){
            await newForm.save();
            const dataLead = {
                ...data,
                id_seller: data.id_user,
            }
            const newLead = new Leads(dataLead);
            await newLead.save();
            return returnDataOrError( [], null, 'Se ha enviado el formulario correctamente.');
        }
        return returnDataOrError( [], null, 'Ocurrió un error, intentelo de nuevo.');
    };

    /**
     * Para devolver la información se hace la petición validando un usuario registrado en la base de datos. 
     * @param {object} user  
     * @returns 
     */
    static async getAll(user){
        if(await validatePermission(user, typePermissions.FormLeads.getAllFormLeads)){
            const forms = await FormLeads.aggregate(
                [    
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },  
                    { $unwind: "$user"}, 
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { geography: 0, id_board: 0, id_category: 0, id_user: 0, id_account: 0, id_campaign: 0, users: 0, message: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            from: "pautas",
                            localField: "id_pauta",
                            foreignField: "_id",
                            as: "pauta"
                        }
                    },  
                    { $unwind: "$pauta"},
                    {
                        $sort: { createdAt: -1 }
                    },
                    {$project: { id_user: 0, updatedAt:0 }},
                ]
            );
            
            if(forms.length > 0){
                return returnDataOrError(forms, null, '');
            }
            return returnDataOrError({}, null, 'No hay formatos de leads registradas');
        }

        if(await validatePermission(user, typePermissions.FormLeads.getAllMyFormLeads)){
            const forms = await FormLeads.aggregate(
                [    
                    { $match: { id_user: user._id }},
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },  
                    { $unwind: "$user"}, 
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { geography: 0, id_board: 0, id_category: 0, id_user: 0, id_account: 0, id_campaign: 0, users: 0, message: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            from: "pautas",
                            localField: "id_pauta",
                            foreignField: "_id",
                            as: "pauta"
                        }
                    },  
                    { $unwind: "$pauta"},
                    {
                        $sort: { createdAt: -1 }
                    },
                    {$project: { id_user: 0, updatedAt:0 }},
                ]
            );

            if(forms.length > 0){
                return returnDataOrError(forms, null, '');
            }
            return returnDataOrError({}, null, 'No hay formatos de leads registradas');
        }
        
        return returnDataOrError({}, null, 'No tiene permisos para esta acción');
    };

    static async getById(user, id_form_lead){
        if(await validatePermission(user, typePermissions.FormLeads.getAllFormLeadsById)){
            const form = await FormLeads.aggregate(
                [    
                    { $match: { _id: ObjectId(id_form_lead) }, },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },  
                    { $unwind: "$user"}, 
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { geography: 0, id_board: 0, id_category: 0, id_user: 0, id_account: 0, id_campaign: 0, users: 0, message: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            from: "pautas",
                            localField: "id_pauta",
                            foreignField: "_id",
                            as: "pauta"
                        }
                    },  
                    { $unwind: "$pauta"},
                    {
                        $sort: { createdAt: -1 }
                    },
                    {$project: { id_user: 0, createdAt:0, updatedAt:0 }},
                ]
            );

            if(form.length > 0){
                return returnDataOrError(form, null, '');
            }  
            return returnDataOrError({}, null, `No hay una formulario registrado con el ID: ${id_form_lead}`);
        }
        
        if(await validatePermission(user, typePermissions.FormLeads.getAllMyFormLeadsById)){
            const form = await FormLeads.aggregate(
                [    
                    { $match: { _id: ObjectId(id_form_lead) }},
                    { $match: { id_user: user._id }},
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },  
                    { $unwind: "$user"}, 
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { geography: 0, id_board: 0, id_category: 0, id_user: 0, id_account: 0, id_campaign: 0, users: 0, message: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            from: "pautas",
                            localField: "id_pauta",
                            foreignField: "_id",
                            as: "pauta"
                        }
                    },  
                    { $unwind: "$pauta"},
                    {
                        $sort: { createdAt: -1 }
                    },
                    {$project: { id_user: 0, createdAt:0, updatedAt:0 }},
                ]
            );

            if(form.length > 0){
                return returnDataOrError(form, null, '');
            }  
            return returnDataOrError({}, null, `No hay una formulario registrado con el ID: ${id_form_lead}`);
        }

        return returnDataOrError({}, null, 'No tiene permisos para esta acción');
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
                if(account) return returnDataOrError({}, null, `Se actualizo satisfactoriamente`); 
                return returnDataOrError({}, null, `No se encontro una cuenta con el ID: ${id}`);
            }

            const account = await Accounts.findByIdAndUpdate(id, data, {new: true});
            if(account) return returnDataOrError({}, null, `Se actualizo satisfactoriamente`);  

            return returnDataOrError({}, null, `No se encontro una cuenta con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
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
                return returnDataOrError({}, null, `No se encontro una cuenta con el ID: ${id}`);
            }
            if(account){
                const config = await ClassConfigurationAccount.delete(account._id);
                return returnDataOrError({account, config}, null, ``);
            };
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    }
}

module.exports = ClassFormLeads;

