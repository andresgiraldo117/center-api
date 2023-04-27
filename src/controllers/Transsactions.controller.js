const Transsactions = require('../models/Transsactions');
const Users = require('../models/User');
const { typePermissions } = require('../Permissions/TypePermissions');
const { validatePermission } = require('../Permissions/Permissions');
const ObjectId = require('mongoose').Types.ObjectId; 
const Boom = require('@hapi/boom');
const axios = require('axios');
const cron = require('node-cron');
const { returnDataOrError } = require('../middlewares/Response');
const Campaign = require('../models/Campaign');
const notificacionsSend = require('../templates/Notifications.template');
const User = require('../models/User');


class ClassTranssaction {    

    static async create(data) {  
        const newTranssaction = new Transsactions(data);
        await newTranssaction.save();
        return returnDataOrError({}, null, `Se creó una la transacción.`);
    };

    static async getAll(user){
        //await ClassTranssaction.validateDetailsTranssationsEpayco();
        //console.log('*********** revisando pagos ***********')

        /* if(await validatePermission(user, typePermissions.Transsaction.getAllTranssactions)){
            const transsactions = await Transsactions.aggregate([
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { identification_number: 0, city: 0, country: 0, address: 0, phone: 0,
                            password: 0, wallet: 0, count: 0, attach: 0, token: 0, location: 0, id_category: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_board: 0, updatedAt: 0}
                }
            ]);

            if(transsactions.length == 0) return returnDataOrError({}, null, `No hay transacciones registradas.`);
            return returnDataOrError(transsactions, null, ``);
        }  */
        //if(await validatePermission(user, typePermissions.Transsaction.getAllMyTranssactions)){

            const transsactions = await Transsactions.aggregate([
                {
                    $match: { id_user: ObjectId(user._id)}
                },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { identification_number: 0, city: 0, country: 0, address: 0, phone: 0,
                            password: 0, wallet: 0, count: 0, attach: 0, token: 0, location: 0, id_category: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1}
                },
                {
                    $project: { id_board: 0, updatedAt: 0}
                }
            ]);
            if(transsactions.length == 0) return returnDataOrError({}, null, `No hay transacciones registradas.`);
            return returnDataOrError(transsactions, null, ``);
        //}
        //return returnDataOrError({}, null, `No tiene permisos para esta acción.`);
    };

    /**
     * Se debe recibir un id por params e instaciar la clase para obtener una cuenta.
     * @param {number} id
     * @returns 
    */
    static async getById(user, id){

            const transsaction = await Transsactions.aggregate([
                {
                    $match: { id_campaing: ObjectId(id)}
                },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { identification_number: 0, city: 0, country: 0, address: 0, phone: 0,
                            password: 0, wallet: 0, count: 0, attach: 0, token: 0, location: 0, id_category: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: '$user' },
            ]);
            if(transsaction.length > 0) return returnDataOrError(transsaction, null, ``);
            return returnDataOrError({}, null, `No hay una transaccion registrada con el ID: ${id}`);

    };

    /**
     * Se valida que el usuario sea un administrador para eliminar una cuenta.
     * Se obtiene el Id de la cuenta a eliminar por params. 
     * @param {object} user
     * @param {number} id   
     * @returns 
     */
    static async delete ( user, id ) {
        if(await validatePermission(user, typePermissions.Transsaction.deleteTranssaction)){
            const transsaction = await Transsactions.findByIdAndDelete(id);
            if(transsaction) return returnDataOrError(transsaction, null, `Transacción eliminada`);
            return returnDataOrError({}, null, `No hay una transaccion registrada con el ID: ${id}`)
        }
        return returnDataOrError({}, null, `No puede realizar esta acción.`)
    }

    static async validateEpaycoAndCreate ( user, reference ) {
        let findcampaign = await Campaign.findById(reference.campaing)
        let finduser = await User.findById(findcampaign.user)
        let adminlist = await Users.find({role: 'owner'})
        let listad_email = adminlist.map(it => it.email)

        const request = await axios.get(`https://secure.epayco.co/validation/v1/reference/${reference.reference}`);
        
        let response = request.data;
        let transaccion;
        const transaccions = await Transsactions.find({id_transsaccion: response.data.x_ref_payco});
        if(transaccions.length === 0){
            transaccion = {
                status: response.data.x_response_reason_text,
                pending: true,
                id_transsaccion: response.data.x_ref_payco,
                type: 'Pago',
                details: `Pago Epayco`,
                amount: response.data.x_amount,
                id_campaing: ObjectId(response.data.x_extra1),
                id_user: user._id,
                data: response.data
            }
            const newTranssaction = await ClassTranssaction.create(transaccion);
            await Campaign.findByIdAndUpdate(ObjectId(reference.campaing), {payment_status: response.data.x_response_reason_text, status: 'Pendiente' });
            //Send Email
            await notificacionsSend.newCampaign(findcampaign.name, finduser.name, findcampaign.date_start, findcampaign.date_end, listad_email);
            await notificacionsSend.newCampaignUser(findcampaign.name, finduser.email);
    
    

            return returnDataOrError({response, newTranssaction}, null, `Se genero la transaccion y esta en estado ${newTranssaction.pending}.`);
        }else{
            return returnDataOrError({response, transaccions}, null, `La transaccion ya fue creada.`);
        }


        /* if(await validatePermission(user, typePermissions.Transsaction.validateEpaycoAndCreateUser)){
        }
        return returnDataOrError({}, null, `No puede realizar esta acción.`); */
    }

    static async tokenEpaycoGenerate ( user, reference ) {
        const URL = `https://apify.epayco.co/login`;
        var config = {
            method: 'post',
            url: URL,
            headers: { 
                'Content-Type': 'application/json'
            },
            auth: {
                username: "a426595e9ea42778220463a89b6e2ac6",
                password: "1fe59bfb08e6abf24f554a86b9b1f3d8"
            },
            data : ''
        };
        
        const response = await axios(config)
        return response.data
    }

    static async getAllDetailsTranssationsEpayco () {
        const URL = `https://apify.epayco.co/transaction`;
        const token = await ClassTranssaction.tokenEpaycoGenerate();
        var config = {
            method: 'post',
            // url: 'https://apify.epayco.co/transaction',
            url: URL,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.token}` 
            },
            data : ''
        };
        const response = await axios(config)
        return response.data
    }

    static async validateDetailsTranssationsEpayco (campaing) {
        const transsactions = await Transsactions.find({type: 'Recarga'})
        const filterTranssactions = transsactions.filter(ele => ele.pending === true);
        const URL = `https://apify.epayco.co/transaction/detail`;
        const token = await ClassTranssaction.tokenEpaycoGenerate();

        for (const t of filterTranssactions) {
            const data = {
                "filter": {
                    "referencePayco": t.id_transsaccion
                }
            };
            const config = {
                method: 'post',
                url: URL,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.token}` 
                },
                data 
            };

            const response = await axios(config);
            if(response.data.data.response === 'Aprobada' || response.data.data.response === 'Rechazada'){
                t.status = response.data.data.response;
                t.pending = false;
                if(t.status === 'Aprobada' && t.pending === false){
                    const user = await Users.findById(t.id_user)
                    user.wallet += t.amount;
                    await user.save();                    
                    await t.save();
                }
            }
            continue;
        }
        if(filterTranssactions > 0){
            return filterTranssactions; 
        }
        return { message: `No hay más transacciones pendientes.`, status: 200 }
    }
}

//cron.schedule('*/50 * * * *', async () => {
//    const response = await ClassTranssaction.validateDetailsTranssationsEpayco();
//    return response
//});

module.exports = ClassTranssaction;
