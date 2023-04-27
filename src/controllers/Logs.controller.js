const Logs = require('../models/Logs');
const Users = require('./../models/User');
const ClassBoards = require('./Boards.controller');
const ObjectId = require('mongoose').Types.ObjectId;
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { returnDataOrError } = require('../middlewares/Response');

class ClassLogs {
    /**
     * Este método se ejecuta desde la ruta de Next de usuarios.
     * Creá un log. 
     * @param {string} id 
     * @param {string} idBoard 
     * @param {string} idAccount 
     * @param {string} idLead 
     * @param {number} value 
     * @returns 
     */
    static async create(id_seller, id_board, id_lead, value, id_pauta) {
        let data = {
            value,
            id_seller,
            id_board,
            id_lead,
            id_pauta
        }
        const newLog = new Logs(data);
        const savedLog = await newLog.save();
        if(savedLog) return returnDataOrError(savedLog, null, ``);
        return returnDataOrError({}, null, `Ocurrio un error al crear.`);
    }

    /**
     * Verifica el usuario para devolver la información.
     * Puede recibir una fecha opcional, que se recibe por body, para hacer filtrado por fecha.
     * Recibe dos fechas, (desde que día, hasta que día) para renderizar la información.
     * Si no se recibe fecha, retorna todos los logs desde el principio de la creación.
     * @param {object} user 
     * @param {date} date 
     * @returns 
     */
    static async getLogs(user, date){
        let dateFrom;
        let dateTo;
        if(Object.keys(date).length === 0){
            dateFrom = new Date("2022-01-01T00:00:00.000Z");
            dateTo = new Date();
        }else {
            dateFrom = date.from;
            dateTo = date.to;
        }

        if(await validatePermission(user, typePermissions.Logs.getAllLogs)){
            const logs = await Logs.aggregate([
                {
                    $match: {  
                        createdAt: {$gte: new Date(dateFrom), 
                        $lte: new Date(dateTo)}
                    }
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
                            {$project: { id_users: 0, id_account: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        localField: "id_board",
                        foreignField: "_id",
                        from: "boards",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $lookup: {
                        pipeline: [
                            {$project: { id_user: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }},
                        ],
                        localField: "id_lead",
                        foreignField: "_id",
                        from: "leads",
                        as: "lead"
                    }
                },
                { $unwind: "$lead"},
                { $sort: { createdAt: -1 }},
                { $project: { id_user: 0, id_board: 0, id_lead: 0 }}
            ]); 
            if(logs.length > 0) return returnDataOrError(logs, null, ``);
            return returnDataOrError({}, null, `No hay logs registrados`);
        }
        if(await validatePermission(user, typePermissions.Logs.getAllMyLogs)){
            const logs = await Logs.aggregate([
                {
                    $match: {
                        id_seller: { $eq: user._id },
                        createdAt: {$gte: new Date(dateFrom), 
                        $lt: new Date(dateTo)}
                    }
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
                            {$project: { id_users: 0, id_account: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        localField: "id_board",
                        foreignField: "_id",
                        from: "boards",
                        as: "board"
                    }
                },
                { $unwind: '$board' },
                {
                    $lookup: {
                        pipeline: [
                            {$project: { id_user: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }},
                        ],
                        localField: "id_lead",
                        foreignField: "_id",
                        from: "leads",
                        as: "lead"
                    }
                },
                { $unwind: "$lead"},
                { $project: { id_seller: 0, id_board: 0, id_lead: 0 }}
            ]); 
            
    
            if (logs.length == 0) return returnDataOrError({}, null, `No hay logs registrados`);
            return returnDataOrError(logs, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    };

    /**
     * Ordenamiento de logs por fecha.
     * Se obtiene 'idUser' y 'idBoard' por params.
     * Ordena la información de acuerdo a los params y la devuelve de manera ordenada uniendo las colecciones 'Logs' y 'Leads' por usuario 
     * @param {string} idUser 
     * @param {string} idBoard 
     * @returns 
     */
    static async getLogBySeller(user, idUser, idBoard){
        if(await validatePermission(user, typePermissions.Logs.getAllLogsBySellerBoard)){
            const logResponse = await Logs.aggregate([
                { 
                    $match: { id_seller: ObjectId(idUser), id_board: ObjectId(idBoard) }
                },
                {$project: {id_board:0, id_seller:0, id_account:0, updatedAt:0}},
                {
                    $lookup: {
                        pipeline: [
                            {$project: { id_user: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }},
                        ],
                        localField: "id_lead",
                        foreignField: "_id",
                        from: "leads",
                        as: "lead"
                    }
                },
                { $unwind: "$lead"},
            ]);
            let response = await ClassLogs.groupByMonthWeek(logResponse);
            return returnDataOrError(response, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción.`);
    }

    /**
     * Método para ordenar Leads de acuerdo a su fecha.
     * Se utiliza en getLogBySeller.
     * 630d381ba5bdd26ff5f30452/board/6256577d6292f0ba2b9b3a2f
     * @param {object} data 
     * @returns 
     */
    static async groupByMonthWeek(data) {
        return data.reduce((acc, obj) => {
            let date = new Date(obj.createdAt);

            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();

            //var [y, m, d] = tempDate[0].split(/\D/);
            [y, m, Math.ceil(d)].reduce((a,v,i) => a[v] || (a[v] = i < 2 ? {} : []), acc).push(obj);
            return acc;
        }, Object.create(null));
    }

    /**
     * Metodo para obtener un log en especifico.
     * Recibe el ID del Log por params.
     * Verifica el usuario que desea tener la información.
     * Dependiendo del usuario devuelve la información.
     * @param {object} user 
     * @param {string} id 
     * @returns 
     */
    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Logs.getAllMyLogsById)){
            const log = await Logs.aggregate(
                [
                    {
                        $match: { id_seller: { $eq: user._id.toString() }, 
                                _id: { $in: [ObjectId(id)]} }
                    },
                    {
                        $lookup: {
                            let: { "id_board": { "$toObjectId": "$id_board" } },
                            pipeline: [
                                {$project: {id_account: 0, id_users: 0, createdAt: 0, updatedAt: 0}},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_board" ] } } }
                            ],
                            from: "boards",
                            as: "board"
                        }
                    },
                    { $unwind: '$board'},
                    {
                        $lookup: {
                            let: { "id_lead": { "$toObjectId": "$id_lead" } },
                            pipeline: [
                                {$project: {id_board: 0, id_seller: 0, id_account:0, createdAt: 0, updatedAt: 0}},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_lead" ] } } }
                            ],
                            from: "leads",
                            as: "lead"
                        }
                    },
                    { $unwind: '$lead'},
                    {
                        $project: { id_seller: 0, id_board: 0, id_lead: 0}
                    }
                ]
            );
            if(log.length === 0) return returnDataOrError({}, null, `No se encontro un log con el ID: ${id}`);
            return returnDataOrError(log, null, ``);
        }
        if(await validatePermission(user, typePermissions.Logs.getAllLogsById)){
            const log = await Logs.aggregate(
                [
                    {
                        $match: { _id: { $in: [ObjectId(id)] } }
                    },
                    {
                        $lookup: {
                            let: { "id_seller": { "$toObjectId": "$id_seller" } },
                            pipeline: [
                                {$project: {identification_number: 0, password: 0, wallet: 0, count: 0,token: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, createdAt: 0, updatedAt: 0}},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_seller" ] } } }
                            ],
                            from: "users",
                            as: "user"
                        }
                    },
                    { $unwind: "$user"},
                    {
                        $lookup: {
                            let: { "id_board": { "$toObjectId": "$id_board" } },
                            pipeline: [
                                {$project: { id_users: 0, id_account: 0, createdAt: 0, updatedAt: 0 }},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_board" ] } } }
                            ],
                            from: "boards",
                            as: "board"
                        }
                    },
                    { $unwind: "$board"},
                    {
                        $lookup: {
                            let: { "id_lead": { "$toObjectId": "$id_lead" } },
                            pipeline: [
                                {$project: { id_user: 0, id_board: 0, id_account: 0, createdAt: 0, updatedAt: 0 }},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_lead" ] } } }
                            ],
                            from: "leads",
                            as: "lead"
                        }
                    },
                    { $unwind: "$lead"},
                    { $project: { id_user: 0, id_board: 0, id_lead: 0 }}
                ]
            ); 
            if(log.length === 0) return returnDataOrError({}, null, `No se encontro un log con el ID: ${id}`)
            return returnDataOrError(log, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción`);
    }

    /**
     * Método para obtener datos analiticos de acuerdo a un board en especifico.
     * Id lo recibe por params y es el ID de un board.
     * Verifica el usuario y dependiendo del usuario renderiza la información.
     * Opcional puede recibir una fecha para filtar Logs y hacer el analisis de acuerdo a las fechas ingresadas.
     * Recibira desde que fecha quiere hacer el filtro, hasta que fecha. 
     * Asi recibe la fecha = {
            "from": "2022-05-01T00:00:00.000Z",
            "to": "2022-05-24T23:59:59.999Z"
        }
     * @param {object} user 
     * @param {string} id 
     * @param {date} date 
     * @returns 
     */
    static async analyticsBoard(user, id, date){
        if(await validatePermission(user, typePermissions.Board.analyticsBoard)){
            let dateFrom;
            let dateTo;
            if(Object.keys(date).length === 0){
                dateFrom = new Date("2022-01-01T00:00:00.000Z");
                dateTo = new Date();
            }else {
                dateFrom = date.from;
                dateTo = date.to;
            }

            let logsBoard = await Logs.aggregate([
                {
                    $match: {  
                        createdAt: {
                            $gte: new Date(dateFrom), 
                            $lt: new Date(dateTo)
                        },
                    }
                },
                {
                    $match: { id_board: id }
                },
            ]);

            console.log('logsBoard :>> ', logsBoard);
            console.log('logsBoard.length :>> ', logsBoard.length);

            let totalLeads = await Logs.find({ createdAt: {$gte: new Date(dateFrom),  $lte: new Date(dateTo)}, } ).count();
            
            let totalValueDescount = logsBoard.reduce( (acc, ele) => { 
                return acc + ele.value;
            }, 0);

            let totalValueBoard = await ClassBoards.analyticsBoard(user, id, dateFrom, dateTo);
            
            let results = { 
                totalValueDescount, 
                totalValueBoard: totalValueBoard.totalValueBoard, 
                totalUsers: totalValueBoard.count, 
                totalLeads 
            }
            return returnDataOrError( results , null, '');
        }
        return returnDataOrError([], null, 'No tiene permisos para esta acción');
    }
}

module.exports = ClassLogs
