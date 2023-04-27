const Pauta = require('../models/Pauta');
const Category = require('../models/Category');
const Board = require('../models/Boards');
const Users = require('../models/User');
const Boom = require('@hapi/boom');
const Format = require('../models/Format');
const Files = require('../models/Files');
const fs = require('fs');
const dirTree = require('directory-tree');


class PautaServices{

    static async getAllPopulateInformation(user){
        let pautas = await Pauta.aggregate(
            [
                {
                    $match: { users: user._id }
                },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { createdAt: 0, updatedAt: 0}},
                        ],
                        from: "formats",
                        localField: "format",
                        foreignField: "_id",
                        as: "formats"
                    }
                },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: { id_boards: 0, updatedAt: 0, createdAt: 0}},
                        ],
                        from: "categories",
                        localField: "id_category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { 
                    $lookup: {
                        pipeline: [
                            {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
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
                            {$project: {identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
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
                            {$project: {id_format: 0, id_board: 0, id_categories: 0, createdAt: 0, updatedAt: 0}},
                        ],
                        from: "campaigns",
                        localField: "id_campaign",
                        foreignField: "_id",
                        as: "campaing"
                    }
                },
                { $unwind: '$campaing' },
                {
                    $project: { format: 0, id_category: 0, id_board: 0, id_user: 0, id_campaign: 0}
                }
            ]
        );
        return pautas;
    } 
}

module.exports = PautaServices;