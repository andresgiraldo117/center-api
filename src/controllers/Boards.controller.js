const Boards = require('../models/Boards');
const Accounts = require('../models/Accounts');
const Users = require('../models/User');
const Landing = require('../models/Landing');
let ObjectId = require('mongoose').Types.ObjectId;
const servicesBoard = require('../services/Board.services');
const Boom = require('@hapi/boom');
const fs = require('fs');
const dirTree = require("directory-tree");
const makeDir = require('make-dir');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const ClassFiles = require('../controllers/Files.controller');
const { returnDataOrError } = require('../middlewares/Response');
const notificacionsSend = require('../templates/Notifications.template');


class ClassBoards {

    /**
     * Se valida que el usuario sea un administrador, para poder crear un tablero.
     * Toda la información del tablero, se recibirá por body.
     * Crea un Tablero.
     * @param {object} user 
     * @param {string} type
     * @param {string} name 
     * @param {number} id_account
     * @param {string} url  
     * @param {string} typePage  
     * @returns 
    */    
    static async create(user, data) {

        if (await validatePermission(user, typePermissions.Board.createBoard)) { 

            if(!data.id_users){
                data.id_users = user._id;
            } 
            data.id_account = user.id_account;
            const newBoard = new Boards(data);
            const account = await Accounts.findOne({ _id: user.id_account })
            account.id_boards.push(newBoard._id);
            await account.save();
            const savedBoard = await newBoard.save();

            
            console.log(savedBoard);

            if(savedBoard){
                const landing = new Landing({
                    title_one: 'Lorem ipsum',
                    title_two: 'Lorem Ipsum',
                    description_one: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a convallis magna, in hendrerit velit. Nullam id sollicitudin lectus, sed semper nulla. Maecenas pulvinar turpis vitae lorem bibendum',
                    description_two: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a convallis magna, in hendrerit velit. Nullam id sollicitudin lectus, sed semper nulla. Maecenas pulvinar turpis vitae lorem bibendum",
                    id_boards: savedBoard._id
                });
                await landing.save();
                if(data.typePage === 'landing' && data.url === ''){
                    data.url = `${data.web_url}landing/${savedBoard._id}`
                    await Boards.findByIdAndUpdate(savedBoard._id, {url : data.url });
                }
                fs.mkdirSync(`./Multimedia/${savedBoard._id}/Pauta`,{recursive:true}, (err) => {
                    if(err) {
                        //console.log(err);
                    }
                });
                return returnDataOrError({}, null, `El tablero de '${data.name}' se creo con exito`);

            } else{
                return returnDataOrError({}, null, 'No se pudo crear el board');
            }
        }
        return returnDataOrError({}, null, 'No puede realizar esta acción');
    };

    /**
     * Se valida el tipo de usuario para poder devolver la información de los tableros de acuerdo a su rol.
     * Se obtiene la información especifica de todos los tableros.
     * @param {object} user 
     * @returns 
     */
    // static async getAll(user) {
    //     let boards = [];
    //     if(await validatePermission(user, typePermissions.Board.getAllBoardsByAccount)){
    //         boards = await Boards.aggregate([
    //             {
    //                 $match: { id_account: user.id_account }
    //             },
    //             {
    //                 $lookup: {
    //                         pipeline: [
    //                             {$project: {nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
    //                         ],
    //                         from: "accounts",
    //                         localField: "id_account",
    //                         foreignField: "_id",
    //                         as: "account"
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     pipeline: [ 
    //                         {
    //                             $project:{ password: 0,token: 0, updatedAt: 0 }
    //                         }
    //                     ],
    //                     from: "users",
    //                     localField: "id_users",
    //                     foreignField: "_id",
    //                     as: "users"
    //                 }
    //             },
    //             {
    //                 $project: { id_users: 0, id_categories: 0, id_account: 0, createdAt: 0, updatedAt: 0}
    //             }
    //         ]);

    //         if(boards.length > 0){
    //             boards.map(o => o.id_users = undefined);
    //             return returnDataOrError(boards, null);
    //         }
    //         if (boards.length == 0) {
    //             const err = Boom.notFound(`No hay tableros registrados`);
    //             return returnDataOrError(null, err);
    //         } 
    //     }
        
    //     if (await validatePermission(user, typePermissions.Board.getAllBoards)) {
    //         boards = await ClassBoards.getboardWithUsers();
    //         if(boards.length > 0){
    //             boards.map(o => o.id_users = undefined);
    //             return returnDataOrError(boards, null);
    //         }
    //         if (boards.length == 0) {
    //             const err = Boom.notFound(`No hay tableros registrados`);
    //             return returnDataOrError(null, err);
    //         }  
    //     } 
    //     else if(await validatePermission(user, typePermissions.Board.getAllMyBoards)) {
    //         boards = await Boards.aggregate([
    //             {
    //                 $match: {
    //                     id_users: {
    //                         $eq: user._id
    //                     }
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     let: { "id_account": { "$toObjectId": "$id_account" } },
    //                         pipeline: [
    //                             {$project: {nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0,    role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
    //                             { "$match": { "$expr": { "$eq": [ "$_id", "$$id_account" ] } } }
    //                         ],
    //                         from: "accounts",
    //                         as: "account"
    //                 }
    //             },
    //             { $unwind: "$account"},
    //             {
    //                 $project: { id_users: 0, id_account: 0 }
    //             }
    //         ])
    //     }

    //     if(user.role !== 'owner'){
    //         boards.map(o => o.id_users = undefined);
    //     }

    //     if (boards.length == 0) return { message: `No hay tableros registrados`, status: 200 } 
    //     // return Boom.notFound(`No hay tableros registrados`).output.payload;
    //     return boards;
    // }
    static async getAll(user) {
        let boards = [];
        boards = await Boards.aggregate([
            {
                $lookup: {
                        pipeline: [
                            {$project: {password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
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
                        {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                    ],
                    from: "users",
                    localField: "id_users",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $project: { id_categories: 0, id_account: 0, createdAt: 0, updatedAt: 0}
            }
        ]);

        if (await validatePermission(user, typePermissions.Board.getAllBoards)) {
            if(boards.length > 0){
                return returnDataOrError(boards, null, '');
            }
            if (boards.length == 0) {
                const err = Boom.notFound(`No hay tableros registrados`);
                return returnDataOrError(null, err);
            }  
        } 
        if(await validatePermission(user, typePermissions.Board.getAllMyBoards)) {
            const boardsAccount = boards.filter( b => JSON.stringify(b.account._id) === JSON.stringify(user.id_account)
            );
            boardsAccount.map(b => b.id_users = undefined );
            if(boardsAccount.length > 0){
                return returnDataOrError(boardsAccount, null, '');
            }
            if (boardsAccount.length == 0) {
                const err = Boom.notFound(`No esta asociado a ningún tablero`);
                return returnDataOrError(null, err);
            }  
        }

        if(await validatePermission(user, typePermissions.Board.getAllMyBoardsSeller)) {
            const boardsSeller = boards.filter( b => JSON.stringify(b.id_users).includes(JSON.stringify(user._id)));
            boardsSeller.map(b => {
                b.id_users = undefined 
                b.users = undefined
            });
            if(boardsSeller.length > 0){
                return returnDataOrError(boardsSeller, null);
            }
            if (boardsSeller.length == 0) {
                const err = Boom.notFound(`No hay tableros registrados`);
                return returnDataOrError(null, err);
            }  
        }


    }

    /**
     * Método para obtener la información de tableros, uniendo las colecciones 'Boards', 'Accounts', 'Users'.
     * Se obtiene la información necesaria de cada colección.
     * @returns 
     */
    static async getboardWithUsers() {
        let boardsWithUsers = await Boards.aggregate(
            [
                {
                    $lookup: {
                        let: { "id_account": { "$toObjectId": "$id_account" } },
                            pipeline: [
                                {$project: {nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
                                { "$match": { "$expr": { "$eq": [ "$_id", "$$id_account" ] } } }
                            ],
                            from: "accounts",
                            as: "account"
                    }
                },
                { $unwind: "$account"},
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
                    $project: { id_users: 0, id_account: 0}
                }
            ]
        );
        if(boardsWithUsers.length > 0) return boardsWithUsers;
        return { message: `No hay tableros registrados`, status: 200 }
        // return Boom.notFound(`No hay tableros aun`).output.payload;
    };

    /**
     * Metodo para validar si un usuario ya existe en un board en especifico.
     * Recibe como argumento la identificación o el email del usuario a verificar.
     * Se envia un obj asi:
     * {
            "id_user": "630d381ba5bdd26ff5f30452",
            "identification_number": "11024123", || email
            "action": "validate"
        }
     * @param {object} board 
     * @param {object} data 
     * @returns 
     */
    static async validateUserBoard ({boardValidatedUser, data}){
        let userId = await Users.find({identification_number: data.identification_number});
        let userEmail = await Users.find({email: data.email});
        let userIncludes;
        if(userId.length >= 1){
            userIncludes = await boardValidatedUser.id_users.includes(userId[0]._id);            
        }
        if(userEmail.length >= 1){
            userIncludes = await boardValidatedUser.id_users.includes(userEmail[0]._id);            
        }

        if(userIncludes){
            return returnDataOrError({}, null, `El usuario '${userId ? userId[0].name : userEmail[0].name}' ya existe en este tablero`);
        }
        return returnDataOrError({}, null, 'El usuario aún no existe en este tablero')

    }
    
    /**
     * Para actualizar un tablero es necesario ingresar como administrador.
     * Se valida que el usuario que desee actualizar un tablero, sea un administrador.
     * Se obtiene un tablero a través de su ID, el cual es ingresado por params.
     * Se valida que tipo de información se quiere actualizar.
     * Para ingresar usuarios a el tablero, se valida si se quiere ingresar uno o varios a la vez, dependiendo del caso toma caminos diferentes.
     * Para ingresar usuarios se deben ingresar por body.
     * Además se debe obtener una acción por body para validar que quiere hacer, ('Eliminar', 'Añadir', 'Validar').
     * @param {object} user 
     * @param {string} id 
     * @param {object} data 
     * @returns 
     */
    static async update(user, id, data) {
        if(await validatePermission(user, typePermissions.Board.updateBoard)){
            
            const boardValidateUser = await findBoardAndValidateUser(id, user);
            if(boardValidateUser.message) return boardValidateUser;

            if(data.id_user){

                if(data.action === 'validate'){
                    return await ClassBoards.validateUserBoard({data, boardValidateUser });
                }

                let usersIds = data.id_user.split(',');
                
                let users = [];
                let usersNotFound = [];
                for (const user of usersIds) {
                    let validateUser = await Users.findById(user);
                    if(!validateUser){
                        usersNotFound.push(user);
                        continue;
                    }
                    users.push(validateUser);
                }

                if( users.length > 0 ) {
                    let usersAdd = [];
                    let usersDelete = [];
                    let usersIncludes = [];
                    for (const user of users) {
                        if(data.action === 'add'){
                            if(boardValidatedUser.id_users.includes(user._id)) {
                                usersIncludes.push(user);
                                continue;
                            } 
                            
                            boardValidatedUser = await Boards.findByIdAndUpdate(id, {
                                $addToSet: { id_users: user._id }
                            });
                            usersAdd.push(user)
                        }
                        if(data.action === 'delete'){ 
                            if(!boardValidatedUser.id_users.includes(user._id)) continue; 
                            boardValidatedUser = await Boards.findByIdAndUpdate(id,
                                {
                                    $pull: {id_users: user._id}
                                }
                            );
                            usersDelete.push(user)
                        }
                    }
                    if(data.action === 'add' && usersAdd.length > 0) return returnDataOrError(`Se añadieron usuarios al tablero`, null, '');
                    if(data.action === 'delete' && usersDelete.length > 0) return returnDataOrError(`Se eliminaron usuarios al tablero`, null, '')
                    else if(data.action === 'add' && usersAdd.length <= 0) return returnDataOrError(`Los usuarios ya estan en el tablero`, null, '');
                    else if(data.action === 'delete' && usersDelete.length === 0) return returnDataOrError(`No se encontraron usuarios para eliminar`, null, '');
                }
            }
            const afterboard = await Boards.findById(id);
            const board = await Boards.findByIdAndUpdate(id, data);
            if(!board) {
                return returnDataOrError({}, null, `No existe un tablero con el id: ${id}`);
            };
            
            if(afterboard.cpc !== data.cpc && board){
                await notificacionsSend.changeCPC(user, data.web_url, data.cpc, data.name);
            }

            return returnDataOrError({}, null, 'Se actualizo con exito')
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
    };

    
    /**
     * Recibe un usuario por query para validar que tenga permisos necesarios para eliminar un tablero
     * El usuario debe ser un administrador.
     * Recibe el ID del tablero por params.
     * Se valida que el ID sea valido y se elimina.
     * @param {object} user 
     * @param {string} id 
     * @returns 
     */
    static async delete(user, id) {
        if(await validatePermission(user, typePermissions.Board.deleteBoard)){

            const boardValidateUser = await findBoardAndValidateUser(id, user);
            if(boardValidateUser.message) return boardValidateUser;

            const board = await Boards.findByIdAndDelete(id);
            if (board) {
                // fs.rm(`./Multimedia/${board.name}`, (err) => {
                //     if(err) //console.log(err)
                // })
                return returnDataOrError(board, null, `Se elimino el tablero de '${board.name}`);
            }
        }
        return returnDataOrError({}, null, `No puede realizar esta acción.`);
    }

    /**
     * Se valida el usuario para devolver la información de acuerdo a su rol.
     * Se debe pasar el ID de un tablero para devolver ese tablero.
     * Dependiendo el Rol, toma un camino diferente.
     * Se hace la unión de colecciones dependiendo el rol
     * @param {object} user 
     * @param {string} id 
     * @returns 
     */
    static async getById(user, id) {
        if(await validatePermission(user, typePermissions.Board.getAllMyBoardsById)){
            //Validate admin_account && seller

            let boardValidateUser = await Boards.findById(id);
            if(!boardValidateUser){
                return returnDataOrError({}, null, `No se encontro un tablero con el ID: ${id}`);
            }

            if(user.role !== 'owner' ){
                if(JSON.stringify(boardValidateUser.id_account) !== JSON.stringify(user.id_account) || !boardValidateUser.id_users.includes(user._id)){
                    return returnDataOrError({}, null, 'No pertenece a esta tablero.');
                }
            }

            if(boardValidateUser.id_users.includes(user._id)) {
                boardValidateUser = await Boards.aggregate(
                [
                    {
                        $match: { _id: { $in: [ObjectId(id)] } }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: {password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
                            ],
                            from: "accounts",
                            localField: "id_account",
                            foreignField: "_id",
                            as: "account"
                        }
                    },
                    { $unwind: "$account"},
                    {
                        $project: { id_users: 0, id_account: 0 }
                    }
                ]);
                return returnDataOrError(boardValidateUser[0], null, '');
            }
        }
        if(await validatePermission(user, typePermissions.Board.getAllBoardsById)){
            // Validate Owner
            let boardValidateUser = await Boards.findById(id);
            if(!boardValidateUser){
                return returnDataOrError({}, null, `No se encontro un tablero con el ID: ${id}`);
            }
            boardValidateUser = await Boards.aggregate(
                [
                    {
                        $match: { _id: { $in: [ObjectId(id)] } }
                    },
                    {
                        $lookup: {
                            // let: { "id_account": { "$toObjectId": "$id_account" } },
                            pipeline: [
                                {$project: {password: 0, nit: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, role: 0, id_users: 0, id_boards: 0, createdAt: 0, updatedAt: 0}},
                                // { "$match": { "$expr": { "$eq": [ "$_id", "$$id_account" ] } } }
                            ],
                            from: "accounts",
                            localField: "id_account",
                            foreignField: "_id",
                            as: "account"
                        }
                    },
                    { $unwind: "$account"},
                    {
                        $lookup: {
                            pipeline: [
                                {$project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, count: 0, nickname: 0, attach: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                            ],
                            from: "users",
                            localField: "id_users",
                            foreignField: "_id",
                            as: "users"
                        }
                    },
                    { $project: { id_users: 0, id_account: 0}}
                ]
            );
            return returnDataOrError(boardValidateUser[0], null, '');
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    /**
     * Se valida el tipo de usuario.
     * Se busca un tablero a través de su ID que es recibido por params.
     * Calcula el total de usuarios activos en ese tablero.
     * Calcula el total de saldo del tablero, sumando las wallets de todos los usuarios y lo retorna.
     * @param {object} user 
     * @param {string} id 
     * @param {*} dateFrom 
     * @param {*} dateTo 
     * @returns 
     */
    static async analyticsBoard(user, id, dateFrom, dateTo){
        // if(await validatePermission(user, typePermissions.Board.analyticsBoard)){
            let boardValidateUser = await Boards.findById(id);

            if(!boardValidateUser){
                return returnDataOrError({}, null, `No se encontro un tablero con el ID: ${id}`);
            }

            if(user.role !== 'owner' ){
                if(JSON.stringify(boardValidateUser.id_account) !== JSON.stringify(user.id_account) || !boardValidateUser.id_users.includes(user._id)){
                    const err = Boom.unauthorized( `No pertenece a esta tablero.`);
                    return returnDataOrError(null, err, '');
                }
            }
            boardValidateUser = await Boards.aggregate(
                [
                    {
                        $match: { _id: { $in: [ObjectId(id)] } }
                    },
                    {
                        $lookup: {
                            pipeline: [
                                {$project: {identification_number: 0, password: 0, token: 0, email: 0, city: 0, country: 0, address: 0, phone: 0, updatedAt: 0}},
                            ],
                            from: "users",
                            localField: "id_users",
                            foreignField: "_id",
                            as: "users"
                        }
                    },
                    { $project: { id_users: 0, id_account: 0}}
                ]
            );
            
            let totalValueBoard = boardValidateUser[0].users.reduce( (acc, ele) => {
                return acc + ele.wallet;
            }, 0);

            let count = 0;
            for (let i = 0; i < boardValidateUser[0].users.length; i++) {
                count += 1;
            }
            
            return { totalValueBoard, count }; 
        // }
        
    }

    static async bulkReload(user, data){
        if(await validatePermission(user, typePermissions.Board.bulkReloadBoard)){
            let minValue = 50000;

            let amountUser = user.wallet;
            if(amountUser < data.amount || data.amount < minValue ) return returnDataOrError({}, null, `No cuenta con el dinero suficiente para la recarga o esta ingresando un valor por debajo del valor minimo ${minValue}`);

            user.wallet -= data.amount;
            await user.save();

            let usersBulk = [];
            let users = data.users.split(',');
            for (const user of users) {
                usersBulk.push( await Users.findById(user));
            }
            
            //Elimina elementos null del array usersBulk
            usersBulk = usersBulk.filter(ele => ele);
            
            let totalByUser = data.amount / usersBulk.length;
            
            for (const user of usersBulk) {
                user.wallet += totalByUser;
                await user.save();
            }

            const response = {
                rechargedUsers: usersBulk.length,
                totalAmountByUser: totalByUser
            }
            return returnDataOrError(response, null, 'Se realizo la recarga a los usuarios correctamente');
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    static async createFiles(user, archivos, idFolder, idFormat){
        if(await validatePermission(user, typePermissions.Board.createFilesBoard)){

            let boardValidateUser = await findBoardAndValidateUser(idFolder, user);
            if(boardValidateUser.message) return boardValidateUser;

            for (const file of archivos) {   
                let date1 = Date.now();
                fs.rename(`./Multimedia/${idFormat + '_' +file.originalname}`, `./Multimedia/${idFolder}/${date1 + '_' + file.originalname}`, function(err) {
                    if ( err ) {
                        console.log('ERROR: ' + err);
                    }
                });

                const newFile = {
                    name: file.originalname,
                    route: `/${idFolder}/${date1 + '_' + file.originalname}`,
                    extension: (file.mimetype).split('/')[1],
                    size: file.size,
                    id_format: idFormat,
                    id_account: boardValidateUser.id_account,
                    id_board: idFolder,
                } 
                
                await ClassFiles.create(newFile)
            }
            return returnDataOrError({}, null, 'Creado el archivo');
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    static async createFolder(user, id, ruta){
        if(await validatePermission(user, typePermissions.Board.createFolderBoard)){

            let boardValidateUser = await findBoardAndValidateUser(id, user);
            if(boardValidateUser.message) return boardValidateUser;

            const path = await makeDir(`./Multimedia/${id}/${ruta.name}`);
            if(path) return returnDataOrError({}, null, 'Se creo el folder con exito')
            return returnDataOrError({}, null, `No se pudo crear el folder`);
        }
        return returnDataOrError({}, null, `No tiene permisos para esta acción`);
    }

    static async getFiles(user, idFolder){
        if(await validatePermission(user, typePermissions.Board.getFilesBoard)){

            let boardValidateUser = await findBoardAndValidateUser(id, user);
            if(boardValidateUser.message) return boardValidateUser;

            const tree = dirTree(`./Multimedia/${idFolder}`, { attributes:['size', 'birthtimeMs','type', 'extension']} , (item, PATH, stats) => {
                //console.log(item);
            });
            if(tree) return returnDataOrError(tree, null, '')
            return returnDataOrError({}, null, `No se encontro un folder con el ID: ${idFolder}`);
        }
        return returnDataOrError({}, null, `No se pudo crear el folder`);
    }
}

async function findBoardAndValidateUser(id, user){
    let boardValidatedUser = await Boards.findById(id);

    if(!boardValidatedUser) {
        return returnDataOrError({}, null, `No existe un tablero con el id: ${id}`);
    };

    if(user.role !== 'owner' ){
        if(JSON.stringify(boardValidatedUser.id_account) !== JSON.stringify(user.id_account)){
            return returnDataOrError({}, null, `No pertenece a esta tablero`);
        }
    }

    return boardValidatedUser;
} 



module.exports = ClassBoards;
