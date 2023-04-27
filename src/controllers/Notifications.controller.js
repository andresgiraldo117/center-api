const Notifications = require('../models/Notifications');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { NotificationsServices } = require('../services/')
var ObjectId = require('mongoose').Types.ObjectId; 
const { returnDataOrError } = require('../middlewares/Response');


class ClassNotifications {

    static async create(user, data){
        // if(await validatePermission(user, typePermissions.Pauta.createPauta)){
            const newNotification = new Notifications(data);
            return returnDataOrError(newNotification, null, ``);
            // return newNotification;
        // }
        // throw Boom.unauthorized(`No tiene permiso para esta acción`);
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Notifications.getAllNotifications)){
            const notifications = await Notifications.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
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
                { $unwind: '$user' },
                {
                    $project: { id_user: 0, updatedAt: 0 }
                }
            ]);
            if(notifications.length === 0) return returnDataOrError({}, null, `No hay notificaciones.`);
            return returnDataOrError(notifications, null, ``);
        }

        if(await validatePermission(user, typePermissions.Notifications.getAllMyNotifications)){
            const notifications = await Notifications.aggregate([
                {
                    $match: { id_user: user._id }
                },
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
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: { id_user: 0, updatedAt: 0 }
                }
            ]);
            if(notifications.length === 0) return returnDataOrError({}, null, `No hay notificaciones.`);
            return returnDataOrError(notifications, null, ``);
        }
        
        return returnDataOrError({}, null, `No tiene permisos para esta acción.`);
    };
    
    static async update(user){
        if(await validatePermission(user, typePermissions.Notifications.updateNotification)){
            const notifications = await Notifications.aggregate([
                {
                    $match: { id_user: user._id }
                },
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
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: { id_user: 0, updatedAt: 0 }
                }
            ]);
            
            const notificationsFilter = notifications.filter( ele => ele.status_user === true || ele.status_user === "true");

            for (const notification of notificationsFilter) {
                await Notifications.updateOne(
                    {_id: notification._id}, 
                    [
                        { $set: {status_user: false}}
                    ]
                );
            }

            if(notificationsFilter.length === 0) return returnDataOrError({}, null, `No hay notificaciones pendientes.`);

            return returnDataOrError(notificationsFilter, null, ``);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    };

    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Notifications.getAllNotificationById)){
            const notification = await Notifications.aggregate([
                {
                    $match: { _id: ObjectId(id)}
                },
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
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: { id_user: 0, updatedAt: 0 }
                }
            ]);

            if(notification.length > 0) return returnDataOrError(notification, null, ``); 
            return returnDataOrError({}, null, `No se encontro una notificacion con el ID: ${id}`);
        }
        if(await validatePermission(user, typePermissions.Notifications.getAllMyNotificationById)){
            const notification = await Notifications.aggregate([
                {
                    $match: { _id: ObjectId(id), id_user: user._id }
                },
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
                { $unwind: '$user' },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: { id_user: 0, updatedAt: 0 }
                }
            ]);

            if(notification.length > 0) return returnDataOrError(notification, null, ``); 
            return returnDataOrError({}, null, `No se encontro una notificacion con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No tiene permiso para esta acción`);
    };
    
    static async delete(user, id){
        if(await validatePermission(user, typePermissions.Notifications.deleteNotificationById)){
            const notification = await Notifications.findByIdAndDelete(id);
            if(notification.length) return returnDataOrError(notification, null, ``); 
            return returnDataOrError({}, null, `No se encontro una notificacion con el ID: ${id}`);
        }
    }

};

module.exports = ClassNotifications;