const Campaigns = require('../models/Campaign');

class ServicesCampaigns {

    static async getPopulate(user){
        const campaigns = await Campaigns.aggregate([
            {
                $match: {id_account: user.id_account}
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
                        {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                    ],
                    from: "categories",
                    localField: "id_categories",
                    foreignField: "_id",
                    as: "categories"
                }
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
                    from: "files",
                    localField: "_id",
                    foreignField: "id_campaign",
                    as: "files"
                }
            },
            { $unwind: '$account' },
            {
                $sort: { createdAt: -1}
            },
            {
                $project: { id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0 }
            },
        ]);
        return campaigns
    }

    static async getPopulateById(user, id){
        const campaigns = await Campaigns.aggregate([
            {
                $match: { _id: id }
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
                            {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "categories",
                        localField: "id_categories",
                        foreignField: "_id",
                        as: "categories"
                    }
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
                    $project: { id_format: 0, id_board: 0, id_categories: 0 }
                }
            
        ]);
        return campaigns
    }
}

module.exports = ServicesCampaigns