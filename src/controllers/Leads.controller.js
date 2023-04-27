const Leads = require('../models/Leads');
const Users = require('../models/User');
let ObjectId = require('mongoose').Types.ObjectId;
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { returnDataOrError } = require('../middlewares/Response');

class ClassLeads {

    /**
     * El método se ejecuta en la ruta de '/users/next/', es la encargada de pasar los parametros necesarios para la creacion del Lead.
     * Crea un Lead.
     * @param {object} data 
     * @param {number} cpc 
     * @param {string} id_account 
     * @param {string} id_board 
     * @param {string} ip 
     * @param {string} url 
     * @param {ObjectId} id_seller 
     * @returns 
     */
    static async create(data) {
        const newLead = new Leads(data);
        const savedLead = await newLead.save();
        if(savedLead) return returnDataOrError(savedLead, null, ``);
        return returnDataOrError({}, null, `Se generó un error al crear.`);
    }

    /**
     * Se valida el Rol del usuario.
     * De acuerdo al Rol se devuelve la información.
     * Retorna todos los leads.
     * @param {object} user 
     * @returns 
     */
    static async getAll(user){
        if(await validatePermission(user, typePermissions.Leads.getAllLeads)){
            const leads = await Leads.aggregate(
                [
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {identification_number: 0, password: 0, wallet: 0, count: 0,token: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            localField: "id_seller",
                            foreignField: "_id",
                            from: "users",
                            as: "user"
                        }
                    },
                    { $unwind: '$user' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {nit: 0, id_users: 0, password: 0, id_boards: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            localField: "id_account",
                            foreignField: "_id",
                            from: "accounts",
                            as: "account"
                        }
                    },
                    { $unwind: '$account' },
                    {
                        $sort: { createdAt: -1}
                    },
                    {
                        $project: {  id_seller: 0, id_account: 0 }
                    }
                ]
            );  
            if (leads.length == 0) return returnDataOrError({}, null, `No hay leads registrados`);
            return returnDataOrError(leads, null, ``);
        }
        if(await validatePermission(user, typePermissions.Leads.getAllMyLeads)){
            const leads = await Leads.aggregate(
                [
                    {
                        $match: { id_seller: user._id },
                    },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {nit: 0, id_users: 0, password: 0, id_boards: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            localField: "id_account",
                            foreignField: "_id",
                            from: "accounts",
                            as: "account"
                        }
                    },
                    { $unwind: '$account' },
                    {
                        $sort: { createdAt: -1}
                    },
                    {
                        $project: { id_board: 0, id_seller: 0, id_account: 0 }
                    }
                ]
            );
            if (leads.length == 0) return returnDataOrError({}, null, `No hay leads registrados`);
            return returnDataOrError(leads, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    /**
     * Validación de usuario.
     * Validación de Lead.
     * Dependiendo del Role, id_Board y id_User retorna el lead.
     * @param {object} user 
     * @param {string} id 
     * @returns 
     */
    static async getById(user, id){
        if( await validatePermission(user, typePermissions.Leads.getAllMyLeadsById)){
            const lead = await Leads.aggregate(
                [
                    {
                        $match: { id_seller: user._id, _id: ObjectId(id) },
                    },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {nit: 0, id_users: 0, password: 0, id_boards: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            localField: "id_account",
                            foreignField: "_id",
                            from: "accounts",
                            as: "account"
                        }
                    },
                    { $unwind: '$account' },
                    {
                        $project: { id_board: 0, id_seller: 0, id_account: 0 }
                    }
                ]
            );
            if(lead.length > 0) return returnDataOrError(lead, null, ``);
            return returnDataOrError({}, null, `No se encontro un Lead con el ID ${id}`);
        }
        if(await validatePermission(user, typePermissions.Leads.getAllLeadsById)) {
            const lead = await Leads.aggregate([
                {
                    $match: { _id: ObjectId(id) }
                },
                {
                    $lookup: {
                        pipeline: [
                            {$project: { identification_number: 0, password: 0, wallet: 0, count: 0,token: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        localField: "id_seller",
                        foreignField: "_id",
                        from: "users",
                        as: "user"
                    }
                },
                { $unwind: "$user"},
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {nit: 0, id_users: 0, password: 0, id_boards: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        localField: "id_account",
                        foreignField: "_id",
                        from: "accounts",
                        as: "account"
                    }
                },
                { $unwind: '$account' },
                { $project: { id_seller: 0, id_board: 0, id_account: 0 }}
            ]);
            if(lead.length > 0) return returnDataOrError(lead, null, ``);
            return returnDataOrError({}, null, `No se encontro un Lead con el ID ${id}`);
        };
        
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    }

    static async getAllByBoard(user, id){

        const leads = await Leads.aggregate([
            {
                $match: { id_board: id}
            },
            { 
                $lookup: {
                    pipeline: [
                        {$project: {id_account: 0, id_users: 0, createdAt: 0, updatedAt: 0}},
                    ],
                    from: "boards",
                    localField: "id_board",
                    foreignField: "_id",
                    as: "board"
                }
            },
        ])
        return leads
    }
}

module.exports = ClassLeads;

