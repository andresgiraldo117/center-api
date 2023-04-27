const Notifications = require('../models/Notifications');

class NotificationsServices{
    static async findAndPopulateGetAll(){
        const notifications = await Notifications.aggregate( [
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
                $lookup: {
                    pipeline: [
                        {$project: {nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
                    ],
                    from: "accounts",
                    localField: "id_account",
                    foreignField: "_id",
                    as: "account"
                }
            },
            {
                $project: { id_user: 0, updatedAt: 0 }
            }
        ]);
        return notifications;
    }

    static async findAndPopulateByUser(user){
        
        const notifications = await Notifications.aggregate([
            {       
                $match: { id_user: user._id }
            }, 
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
        return notifications;
    }

    static async changeStateUser(){

    }
}

module.exports = NotificationsServices;