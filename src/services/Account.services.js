const Accounts = require('../models/Accounts');

class AccountServices{
    /**
     * Método para devolver la información de cuenta con la unión de dos tablas 'Accounts' y 'Boards'. 
     * @returns 
     */
    static async getAllWithBoards(){
        let boardsWithUsers = await Accounts.aggregate(
            [            
                {
                    $lookup: {
                        pipeline: [
                            {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "boards",
                        localField: "id_boards",
                        foreignField: "_id",
                        as: "boards"
                    }
                },
                {
                    $lookup: {
                        // pipeline: [
                        //     {$project: { password: 0,id_users:0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
                        // ],
                        from: "configuration_account",
                        localField: "configuration",
                        foreignField: "_id",
                        as: "configuration"
                    }
                },
                {$project: { id_users: 0, id_boards: 0, id_account: 0, createdAt:0, updatedAt:0 }},
            ]
        );
        if(boardsWithUsers.length === 0) throw Boom.notFound(`No hay cuentas para listar`);
        
        for (const account of boardsWithUsers) {
            account.password = undefined;
        }

        return boardsWithUsers;
    }
}

module.exports = AccountServices;