const Boards = require('../models/Boards');

class BoardServices{
    /**
     * Método para devolver la información de cuenta con la unión de dos tablas 'Accounts' y 'Boards'. 
     * @returns 
     */
    static async getAll(){
        const boards = await Boards.aggregate([
            {
                $match: { id_account: user.id_account }
            },
            {
                $lookup: {
                    // let: { "id_account": { "$toObjectId": "$id_account" } },
                        pipeline: [
                            {$project: {nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
                            // { "$match": { "$expr": { "$eq": [ "$_id", "$$id_account" ] } } }
                        ],
                        from: "accounts",
                        localField: "id_account",
                        foreignField: "_id",
                        as: "account"
                        // from: "accounts",
                        // as: "account"
                }
            },
            {
                $lookup: {
                    pipeline: [ 
                        {
                            $project:{ password: 0,token: 0, updatedAt: 0 }
                        }
                    ],
                    from: "users",
                    localField: "id_users",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $project: { id_users: 0, id_categories: 0, id_account: 0, createdAt: 0, updatedAt: 0}
            }
        ]);
    }
}

module.exports = BoardServices;