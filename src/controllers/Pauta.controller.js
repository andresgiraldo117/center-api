const Pauta = require('../models/Pauta');
const ClassLeads = require('../controllers/Leads.controller');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');
const Notifications = require('../controllers/Notifications.controller');
const Board = require('../models/Boards');
const Users = require('../models/User');
const Transactions = require('../models/Transsactions');
const Files = require('../models/Files');
const ClassTanssaction = require('../controllers/Transsactions.controller');
const ClassNotifications = require('../templates/Notifications.template');
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const Format = require('../models/Format');
const dirTree = require('directory-tree');
const cron = require('node-cron');
const { returnDataOrError } = require('../middlewares/Response');
var ObjectId = require('mongoose').Types.ObjectId; 


class ClassPauta {

    static async forInformation(array, db){
        let elements = []
        if(db === 'categories'){
            for (const ele of array) {
                let element = await Category.findById(ele);
                if(element) elements.push(element._id);
                continue;
            }
        }
        if(db === 'users'){
            for (const ele of array) {
                let element = await Users.findById(ele);
                if(element) elements.push(element._id);
                continue;
            }
        }
        if(db === 'format'){
            for (const ele of array) {
                let element = await Format.findById(ele);
                if(element) elements.push(element._id);
                continue;
            }
        }
        return elements;
    }

    static async create(user, data){
        if(await validatePermission(user, typePermissions.Pauta.createPauta)){
            if(user.wallet < data.initial_budget) return returnDataOrError([], null, `No se puede crear por saldo.`);

            let board = await Board.findById(data.id_board);
            if(!board) return returnDataOrError([], null, `No existe un board con el ID: ${data.id_board}`);
            
            let newPauta;
            data.id_account = user.id_account;
            data.id_user = user._id;
            data.saldo = data.initial_budget;

            if(data.users){
                let arrUsers = data.users.split(',');
                let users = await ClassPauta.forInformation(arrUsers, 'users');
                data.users = users;
            }else{
                data.users = user._id;
            }
    
            const campaign = await Campaign.findById(data.id_campaign);
            if(campaign) {
                data.duration = campaign.duration;
                data.date_start = campaign.date_start;
                data.date_end = campaign.date_end;
            }
            
            newPauta = new Pauta(data);
            await newPauta.save();

            let pauta = await Pauta.findById(newPauta._id);

            for (const userPauta of pauta.users) {
                const userDb = await Users.findById(userPauta);
                if(userDb){
                    const email = await ClassNotifications.emailAddToPauta(userDb, pauta);
                        const pautaNotification = {
                            title: `Pauta`,
                            description: `El usuario ${user.name} te añadio a la pauta ${pauta.name}`,
                            id_user: userPauta,
                            status_user: true,   
                            status_mail: true,   
                        }
                        await Notifications.create(pautaNotification); 
                }
                continue;
            }
            
            let transsaction = {
                status: pauta.status,
                type: 'Pauta',
                details: `Creacion de pauta con el nombre: ${campaign.name}`,
                amount: pauta.initial_budget,
                id_board: pauta.id_board,
                id_user: pauta.id_user,
                id_transsaccion: pauta._id
            }

            await ClassTanssaction.create(transsaction);
            
            if(pauta) return returnDataOrError([], null, `La pauta fue creada con exito.`); 
            return returnDataOrError([], null, `Ocurrio un error al crear`); 
        }
        return returnDataOrError([], null, `No tiene permisos para esta acción`);
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Pauta.getAllPauta)){
            const pautas = await Pauta.aggregate(
                [
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: '$user' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "users",
                            foreignField: "_id",
                            as: "users"
                        }
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
                    { $unwind: '$board' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { id_account: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {createdAt: 0, updatedAt: 0}},
                            ],
                            from: "formats",
                            localField: "campaign.id_format",
                            foreignField: "_id",
                            as: "formats"
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: { id_account: 0, id_campaign: 0, format: 0, id_board: 0, id_user: 0, updatedAt: 0, }
                    }
            ]);
            if(pautas.length === 0) return returnDataOrError([], null, `No hay ninguna pauta creada`);;
            let response = []
            for (const p of pautas) {
                const multimedia = await Files.find({ id_campaign: p.id_campaign });
                if(multimedia.length > 0){
                    response.push({
                        ...p,
                        multimedia,
                    })
                }
            }

            if(pautas.length > 0) return returnDataOrError(response, null, ``);
            return returnDataOrError([], null, `No hay pautas creadas`);
        }

        if(await validatePermission(user, typePermissions.Pauta.getAllMyPautas)){
            const pautas = await Pauta.aggregate(
                [
                    {
                        $match: { id_account: user.id_account }
                    },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: '$user' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "users",
                            foreignField: "_id",
                            as: "users"
                        }
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
                    { $unwind: '$board' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { id_account: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {createdAt: 0, updatedAt: 0}},
                            ],
                            from: "formats",
                            localField: "campaign.id_format",
                            foreignField: "_id",
                            as: "formats"
                        }
                    },
                    { $sort: { createdAt: -1}}, 
                    {
                        $project: { id_campaign: 0, id_account: 0, format: 0, id_board: 0, id_user: 0, updatedAt: 0, createdAt: 0}
                    }
                ]
            );
            if(pautas.length === 0) return [];
            const response = []
            for (const p of pautas) {
                
                const multimedia = await Files.find({ id_campaign: p.campaign._id });
                
                if(multimedia.length > 0){
                    response.push({
                        ...p,
                        multimedia,
                    })
                }
            }
            if(pautas.length > 0) return returnDataOrError(response, null, ``);
            return returnDataOrError([], null, `No hay pautas creadas`);
        }
        return returnDataOrError([], null, `No tiene permisos para esta acción`);
    }
    
    static async update(user, id, data){
        if(await validatePermission(user, typePermissions.Pauta.updatePauta)){
            const pautaConfir = await Pauta.findById(id);
            if(pautaConfir.status === 'false' || pautaConfir.status === 'true' || pautaConfir.status === false || pautaConfir.status === true)
                return returnDataOrError([], null, `No puede modificar una pauta que ya se aprovó o se rechazó`);
            
            if(data.check || data.check === 'true'){
                let pauta = await Pauta.findById(id);
                if(pauta.status === true || pauta.status === false || pauta.status === 'true' || pauta.status === 'false'){
                    return returnDataOrError([], null, `Esta pauta no se puede modificar porque ya cambio su estado`);
                }
                let userPauta = await Users.findById(pauta.id_user);

                if(userPauta.wallet < pauta.saldo){
                    let pauta = await Pauta.findById(id);
                    pauta.status = false;
                    pauta.message = `Se rechazo por saldo del usuario`;
                    const savedPauta = await pauta.save();
                    return returnDataOrError([], null, `El usuario '${userPauta.name}' no cuenta con suficiente dinero para crear la pauta`);
                }

                if(userPauta.wallet >= pauta.saldo){
                    userPauta.wallet -= pauta.saldo;
                    await userPauta.save();
                    pauta.status = true;
                    pauta.message = 'Pauta Aprovada';
                    pauta.date_start = new Date();
                    const savedPauta = await pauta.save();
                    const transsaction = new Transactions({
                        status: savedPauta.status,
                        pending: false,
                        type: 'Pauta',
                        // details: `Creacion de pauta con el nombre: ${pauta.campaign.name}`,
                        details: `Creacion de pauta.`,
                        amount: savedPauta.initial_budget,
                        id_board: savedPauta.id_board,
                        id_user: savedPauta.id_user,
                        id_user: savedPauta.id_account,
                    });
                    await transsaction.save();
                    // const usersForPauta = [];
                    // for (const user of savedPauta.users) {
                    //     usersForPauta.push(user);
                    // }
                    // for (const user of usersForPauta) {
                    //     const userDb = await Users.findById(user);
                    //     if(userDb){
                    //         const email = await ClassNotifications.emailToApprovedPauta(userDb, savedPauta.name);
                    //         const pautaNotification = {
                    //             title: `Pauta aprobada`,
                    //             description: `La pauta ${savedPauta.name} ha sido aprobada`,
                    //             id_user: user,
                    //             // status_admin: { type: Boolean, required: true, trim: true, default: false },
                    //             status_user: true,   
                    //             status_mail: true,   
                    //         }
                    //         await Notifications.create(pautaNotification); 
                    //     }
                    //     continue;
                    }
            }
            if(data.check === false || data.check === "false"){
                let pauta = await Pauta.findById(id);
                pauta.status = false;
                pauta.message = data.message;
                const savedPauta = await pauta.save();
                // const usersForPauta = savedPauta.users;
                //     usersForPauta.push(savedPauta.id_user);
                //     for (const user of usersForPauta) {
                //         const userDb = await Users.findById(user);
                //         if(userDb){
                //             const email = await ClassNotifications.emailToDisapprovePauta(userDb.name, savedPauta.name);
                //             const pautaNotification = {
                //                 title: `Pauta desaprobada`,
                //                 description: `La pauta ${savedPauta.name} ha sido desaprobada`,
                //                 id_user: user,
                //                 // status_admin: { type: Boolean, required: true, trim: true, default: false },
                //                 status_user: true,   
                //                 status_mail: true,   
                //             }
                //             await Notifications.create(pautaNotification); 
                //         }
                //         continue;
                //     }
                // const pautaNotification = {
                //     title: `Pauta fue rechazada.`,
                //     description: `La pauta fue rechazada `,
                //     id_user: user._id,
                // }
                // await Notifications.create(pautaNotification); 
                return returnDataOrError([], null, `La pauta fue denegada`);
            }
            let pauta = await Pauta.findByIdAndUpdate(id, data, {new: true});
            if(pauta) return returnDataOrError([], null, `Se actualizo con exito la Pauta`);
            return returnDataOrError([], null, `No se encontro una pauta con el ID: ${id}`);
        }
        return returnDataOrError([], null, `No tiene permiso para esta accion`);
    };

    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Pauta.getAllPautaById)){
            const pauta = await Pauta.aggregate(
                [
                    {
                        $match: { _id: ObjectId(id)}
                    },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: '$user' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "users",
                            foreignField: "_id",
                            as: "users"
                        }
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
                    { $unwind: '$board' },
                    { 
                        $lookup: {
                            pipeline: [
                                {$project: { id_account: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
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
                                {$project: {createdAt: 0, updatedAt: 0}},
                            ],
                            from: "formats",
                            localField: "campaign.id_format",
                            foreignField: "_id",
                            as: "formats"
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: { format: 0, id_board: 0, id_user: 0, updatedAt: 0, createdAt: 0}
                    }
            ]);

            if(pauta.length> 0) {
                const multimedia = dirTree(`./Multimedia/${pauta.id_board}/Pauta`, (item, PATH, stats) => {
                });
                return returnDataOrError({pauta, multimedia}, null, ``)
            };

            return returnDataOrError([], null, `No se encontro una pauta con el ID: ${id}`);
        }
        return returnDataOrError([], null, `No tiene permiso para esta accion`);
    };

    // static async deletePa(user){
    //     const deleteP = await Pauta.remove([]);
    //     return deleteP 
    // }
    
    static async deletePauta(user, id){
        const deleteP = await Pauta.findByIdAndDelete(id);
        return returnDataOrError(deleteP, null, `Se elimino la pauta`);
        // return deleteP;
    }

    static async validatedStatusPautas(){
        const pautas = await Pauta.find({status: 'Pending', status: 'true' });
        const date = new Date();
        const pautaUpdated = []
        for (const p of pautas) {
            const dateP = new Date(p.date_end).getTime();
            if(dateP < date){
                p.status = 'false'
                await p.save();
                pautaUpdated.push(p);
            }
        }
        if(pautaUpdated.length > 0){
            return returnDataOrError([], null, `Se actualizaron ${pautaUpdated.length} pautas.`);
        }
        return returnDataOrError([], null, `No hay pautas pendientes`);
    }

    static async anality( user, {idBoard, year, month}){
        if(await validatePermission(user, typePermissions.Pauta.analityBoard)){

            let dateFrom;
            let lastDayOfMonth;
            if(!year && !month){
                dateFrom = new Date("2022-01-01T00:00:00.000Z");
                lastDayOfMonth = new Date();
            }else {
                dateFrom = new Date(`${month},01,${year}`);
                let dateEnd = new Date(`${month}, 01/, ${year}`);
                lastDayOfMonth = new Date(dateEnd.getFullYear(), dateEnd.getMonth()+1, 0);
            }
    
            const pautas = await Pauta.aggregate([
                {
                    $match: { id_board: ObjectId(idBoard), 
                    createdAt: { $gte: new Date(dateFrom), $lte: new Date(lastDayOfMonth) }}
                },
            ]);

            if(pautas.length === 0) returnDataOrError([], null, `No hay datos de pautas.`);
    
            const leads = await ClassLeads.getAllByBoard( null , idBoard);
    
            let totalAmount = 0;
            let totalGastado = 0;
            let totalPautasActive = 0;
            let totalPautasInactive = 0;
            let totalPautasByBoard = pautas.length;
    
            for (const p of pautas) {
                totalAmount += p.initial_budget;
                let totalG = p.initial_budget - p.saldo;
                totalGastado += totalG;
                if(p.status === 'true' || p.status === true ){
                    totalPautasActive += 1;
                }
                if(p.status === 'Pending' || p.status === 'false' ){
                    totalPautasInactive += 1;
                }
            } 
            const response = {totalPautasByBoard, totalAmount, totalGastado, totalPautasActive, totalPautasInactive, clics: leads.length, };
            return returnDataOrError(response, null, "");
        }

        return returnDataOrError([], null, `No tiene permiso para esta acción.`);
    }
    
};

cron.schedule('*/10 * * * *', async () => {
    const response = await ClassPauta.validatedStatusPautas();
    // console.log(response)
    return response
});


module.exports = ClassPauta;