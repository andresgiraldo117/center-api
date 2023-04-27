const Campaign = require('../models/Campaign');
const Board = require('../models/Boards');
const ClassFiles = require('./Files.controller');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const Format = require('../models/Format');
const fs = require('fs');
const dirTree = require('directory-tree');
const { ServicesCampaigns } = require('../services');
var ObjectId = require('mongoose').Types.ObjectId; 
const { returnDataOrError } = require('../middlewares/Response');
const Transactions = require('../models/Transsactions');


class ClassCampaign {

    static async updateStatus(user, id, data){

        console.log(data);
        let campaign = await Campaign.findById(id);
        if(campaign){

            await Campaign.findByIdAndUpdate(ObjectId(id), {
                status: data.status,
                message: data.message,
            });

            return { status: 200, response: {}, message: `updated` }
        }else{
            return { status: 203, response: {}, message: `No existe la campaña` }
        }

    }

    static async update(user, id, data, archivos){

        let campaign = await Campaign.findById(id);
        if(campaign){

            await Campaign.findByIdAndUpdate(ObjectId(id), data);
    
            if(archivos){
                for (const file of archivos) {
                    let date1 = Date.now();
    
                    if (!fs.existsSync(`./Multimedia/Campaigns/${id}`)){
                        fs.mkdirSync(`./Multimedia/Campaigns/${id}`, {recursive: true});
                    }   
                    fs.rename(`./Multimedia/${file.filename}`, `./Multimedia/Campaigns/${id}/${id}_${date1}_${file.originalname}`, function(err) {
                        if ( err ) {
                            console.log('ERROR: ' + err);
                        }
                    });
                    const newFile = {
                        name: file.originalname,
                        route: `/Campaigns/${id}/${id}_${date1}_${file.originalname}`,
                        extension: (file.mimetype).split('/')[1],
                        size: file.size,
                        id_format: campaign.medialist,
                        id_campaign: id,
                    } 
                    await ClassFiles.create(newFile);
                }
            }
            if(data.initial_budget && Number(data.previous_step) > 9){
                const transsaction = new Transactions({
                    status: 'pending',
                    pending: false,
                    type: 'Pauta',
                    details: `Creacion de pauta.`,
                    amount: data.initial_budget,
                    id_campaign: id,
                    id_user: user._id,
                });
            }

            return { status: 200, response: {}, message: `updated` }
        }else{
            return { status: 203, response: {}, message: `No existe la campaña` }
        }

    }

    static async create(user, data, archivos){

        //if(await validatePermission(user, typePermissions.Campaign.createCampaign)){
            let newCampaign;
            
            data.user = user._id;
            /* let categories = data.id_categories.split(',');

            data.id_account = user.id_account;
            data.id_categories = categories;
            let formats = data.id_format.split(',');
            let formatsDb = [];
            for (const format of formats) {
                let formatDb = await Format.findById(format);
                if(formatDb) formatsDb.push(formatDb._id);
                continue;
            }
            data.id_format = formatsDb;
            data.date_start = new Date(data.date_start);
            data.date_end = new Date(data.date_end);
            let duration = (data.date_end.getTime() - data.date_start.getTime()) / (1000 * 60 * 60 * 24).toFixed(1);
            data.duration = duration; */
            newCampaign = new Campaign(data);
            await newCampaign.save();
            
            let campaign = await Campaign.findById(newCampaign._id);
            
            /* for (const file of archivos) {
                let date1 = Date.now();

                if (!fs.existsSync(`./Multimedia/Campaigns/${campaign._id}`)){
                    fs.mkdirSync(`./Multimedia/Campaigns/${campaign._id}`, {recursive: true});
                }   
                fs.rename(`./Multimedia/${file.filename}`, `./Multimedia/Campaigns/${campaign._id}/${campaign._id}_${date1}_${file.originalname}`, function(err) {
                    if ( err ) {
                        console.log('ERROR: ' + err);
                    }
                });
                const newFile = {
                    name: file.originalname,
                    route: `/Campaigns/${campaign._id}/${campaign._id}_${date1}_${file.originalname}`,
                    extension: (file.mimetype).split('/')[1],
                    size: file.size,
                    id_format: campaign.id_format,
                    id_account: board.id_account,
                    id_campaign: campaign._id,
                    id_board: campaign.id_board,
                } 
                await ClassFiles.create(newFile);
            } */

            if(campaign) return returnDataOrError(campaign, null, `La Campaña fue creada con exito`); 

            return returnDataOrError([], null, `Ocurrio un error al crear`); 
        //}
        //return returnDataOrError([], null, `No tiene permiso para esta acción`); 
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Campaign.getAllCampaigns)){
            const campaigns = await Campaign.aggregate(
                [    
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
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "formats",
                            localField: "id_format",
                            foreignField: "_id",
                            as: "formats"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "files",
                            localField: "_id",
                            foreignField: "id_campaign",
                            as: "files"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "boards",
                            localField: "id_board",
                            foreignField: "_id",
                            as: "board"
                        }
                    },
                    { $unwind: '$board' },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: { id_format: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }
                    },
                ]
            ); 
            if(campaigns.length === 0) return returnDataOrError([], null, `No hay campañas aun para listar`); 
            if(campaigns.length > 0){
                return returnDataOrError(campaigns, null, ``);
            }
        }
        if(await validatePermission(user, typePermissions.Campaign.getAllMyCampaigns)){
            const campaigns = await ServicesCampaigns.getPopulate(user);
            if(campaigns.length === 0) return returnDataOrError([], null, `No hay campañas aun para listar`);
            if(campaigns.length > 0){
                return returnDataOrError(campaigns, null, ``);
            }
        }

        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    };

    static async getById(user, id){
        console.log(id)

        //if(await validatePermission(user, typePermissions.Campaign.getAllCampaignsById)){
            const campaign = await Campaign.aggregate(
                [    
                    {
                        $match: { _id: ObjectId(id)}
                    },          
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "files",
                            localField: "_id",
                            foreignField: "id_campaign",
                            as: "files"
                        }
                    },
                    
            ]);
            if(campaign.length > 0){
                return returnDataOrError(campaign, null, ``); 
            }
            return returnDataOrError([], null, `No se encontro una campaña con el ID: ${id}`);
        //}
        /* if(await validatePermission(user, typePermissions.Campaign.getAllMyCampaignsById)){
            const campaign = await Campaign.aggregate(
                [    
                    {
                        $match: { _id: ObjectId(id)}
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
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "formats",
                            localField: "id_format",
                            foreignField: "_id",
                            as: "formats"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "files",
                            localField: "_id",
                            foreignField: "id_campaign",
                            as: "files"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "boards",
                            localField: "id_board",
                            foreignField: "_id",
                            as: "board"
                        }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                            ],
                            from: "files",
                            localField: "_id",
                            foreignField: "id_campaign",
                            as: "files"
                        }
                    },
                    { $unwind: '$board' },
                    {
                        $sort: { createdAt: -1}
                    },
                    {
                        $project: { id_format: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }
                    },
            ]);
            if(campaign.length > 0){
                return returnDataOrError(campaign, null, ``); 
            }
            return returnDataOrError([], null, `No se encontro una campaña con el ID: ${id}`);
        } */
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    };

    static async getBoardById(user){

        let pipeline = []; 

        if(user.role === 'owner'){
            pipeline = [      
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "users"
                    }
                },       
                { $unwind: '$users' },
                {
                    $sort: { createdAt: -1}
                },
            ]
        }else{
            pipeline = [        
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "users"
                    }
                },  
                { $unwind: '$users' },

                {
                    $match: { user : ObjectId(user._id) }
                },        
                {
                    $sort: { createdAt: -1}
                },
            ]
        }

        const campaign = await Campaign.aggregate(pipeline);

        if(campaign.length > 0) return returnDataOrError(campaign, null, ``); 

        return returnDataOrError([], null, `No se encontrarón campañas`);
    };

    static async deleteAll(user){
        if(await validatePermission(user, typePermissions.Campaign.deleteAll)){
            const deleteCampaigns = await Campaign.remove([]);
            return returnDataOrError(deleteCampaigns, null, `Se eliminaron todas las campañas.`);
        }
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    }
    
    static async delete(user, id_campaign){
        if(await validatePermission(user, typePermissions.Campaign.deleteCampaignById)){
            const deleteCampaign = await Campaign.findByIdAndDelete(id_campaign);
            if(deleteCampaign){
                return returnDataOrError(deleteCampaign, null, `Se eliminó la campaña ${deleteCampaign.name}.`);
            }
            return returnDataOrError([], null, `No se encontró una campaña con el Id ${id}`);
        }

        if(await validatePermission(user, typePermissions.Campaign.deleteMyCampaignById)){
            const deleteCampaign = await Campaign.deleteOne({ _id: id_campaign, id_account: user.id_account });
            if(deleteCampaign.deletedCount > 0){
                return returnDataOrError(deleteCampaign, null, `Se eliminó la campaña.`);
            }
            return returnDataOrError([], null, `No se encontró una campaña con el Id ${id}`);
        }
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    }

};

module.exports = ClassCampaign;