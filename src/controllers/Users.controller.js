const Accounts = require('../models/Accounts')
const Pautas = require('../models/Pauta'),
Users = require('../models/User'),
Boards = require('../models/Boards'),
ClassLog = require('./Logs.controller'),
ClassLead = require('./Leads.controller'),
fs = require('fs'),
csv = require('csv-parser');
let ObjectId = require('mongoose').Types.ObjectId;
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { getTokenData } = require('../jwt.config');
const { returnDataOrError } = require('../middlewares/Response');


const regex = {
    regexName: /^([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+)(\s+([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+))*$/,
    regexIdentificacion: /^([0-9])*$/,
    regexEmail: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    regexPhone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,

}

class ClassUsers {

    static async cargaMasiva (user, file, idBoard){
        let results = [];
        const usersJson = await new Promise((resolve, reject) => {
            fs.createReadStream(`./uploads/${file}`)
                .pipe(csv())
                .on("data",  (data)=> {
                    results.push(data)
                })
                .on('end', () => {
                    resolve(results);
                }
            );
            
        });
        
        fs.writeFile(`./uploads/usersUploads/${user._id}_${idBoard}_${Date.now()}.csv`, JSON.stringify(usersJson), (err)=> {
            if(err)throw Boom.badData(err);
        });
        fs.unlink(`./uploads/${file}`, (err) => {
            if(err)throw Boom.badGateway(err.message);
        })

        const response = await ClassUsers.cargaMasivaCreate(user, usersJson, idBoard);
        return response;
    } 

    static async cargaMasivaCreate(user, usersJson, idBoard){
        let newUser; 
        if(!idBoard) return returnDataOrError([], null, `Debe escoger un tablero`); 
        const board = await Boards.findById(idBoard);

        if(!board) return returnDataOrError([], null, `No se encontro el tablero`); 

        if(await validatePermission(user, typePermissions.User.bulkReloadUsers)){
            let userValid = [];
            let userInvalid = [];
            for (const ele of usersJson) {
                if (ele.name.trim().length === 0 || ele.identification_number.trim().length === 0 || ele.email.trim().length === 0 || ele.city.trim().length === 0 || ele.country.trim().length === 0 || ele.address.trim().length === 0 || ele.password.trim().length === 0){
                    userInvalid.push(ele);
                    continue;
                }
                if(regex.regexName.test(ele.name) && regex.regexIdentificacion.test(ele.identification_number) && regex.regexEmail.test(ele.email) && regex.regexPhone.test(ele.phone)){
                    userValid.push(ele);
                }else{
                    userInvalid.push(ele);
                    continue;
                }
            }
            let userExistente = [];
            for (const ele of userValid) {
                let userDb = await Users.find({identification_number: ele.identification_number});
                if(userDb.length > 0){
                    userExistente.push(userDb[0]);
                    continue;
                } else{
                    newUser = new Users(
                        { 
                            name: ele.name,
                            email: ele.email, 
                            city: ele.city,
                            country: ele.country,
                            address: ele.address,
                            phone: ele.phone,
                            identification_number: ele.identification_number,
                            nickname: ele.nickname,
                            attach: ele.attach,
                            password: await Users.encryptPassword(ele.password) 
                        }
                    );
                    const savedUser = await newUser.save();
                    await Boards.findOneAndUpdate(
                        { $match: { _id: ObjectId(idBoard) } },
                        { $addToSet: { id_users: savedUser._id}}
                    );
                }
            }
            if(userExistente.length > 0){
                for(const ele of userExistente){
                    if(!board.id_users.includes(ele._id)){
                        board.id_users.push(ele._id);
                        await board.save(); 
                    }
                    continue;
                }
            }
            return returnDataOrError({
                userCreated: userValid,
                userNoCreated: userInvalid,
                userExistente: userExistente.length
            }, null, `Se crearon ${userValid.length === userExistente.length? 0 : userValid.length} usuarios, y se descartaron ${userInvalid.length} usuarios por no cumplir con los parametros necesarios.`);
        }
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    }


    /**
     * Crea un vendedor en el sistema.
     * Verifica que el usuario que lo va a crear tenga los permisos para esa acción.
     * Toda la información del nuevo usuario se va a recibir por body.
     * @param {object} user  
     * @param {object} data 
     * @param {string} name  
     * @param {string} email  
     * @param {string} city  
     * @param {string} country  
     * @param {string} address  
     * @param {number} phone  
     * @param {number} identification_number  
     * @param {string} nickname  
     * @param {string} attach  
     * @param {string} password  
     * @returns 
     */
    static async create (user, data, systemValidated = false) {

        let newUser; 
        if(systemValidated === true || systemValidated === 'true' || await validatePermission(user, typePermissions.User.createUser) ){
            if(data.board){
                const board = await Boards.findById(data.boards);
                if(!board) return returnDataOrError([], null, `El tablero con el ID ${data.boards} no se encontro`);
            }
            if(data.type_account === 'company'){
                newUser = new Users({
                    ...data,
                })
            }else{
                newUser = new Users({
                    ...data,
                    password: await Users.encryptPassword(data.password),                    
                    id_account: user._id
                })
            }
            const savedUser = await newUser.save();
            await Boards.findOneAndUpdate(
                { $match: { _id: ObjectId(data.boards) } },
                { $addToSet: { id_users: savedUser._id}}
            )
            
            if(systemValidated){
                return returnDataOrError(savedUser, null, ``);
            }
            return returnDataOrError([], null, `Creado con exito.`);
            
        }
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    };

    /**
     * Método para mapear la información en otros métodos.
     * @param {object} data 
     * @returns 
     */
    static async renderUser(data){
        const user =  {
            _id: data._id,
            name: data.name,
            identification_number: data.identification_number,
            nickname: data.nickname,
            address: data.address,
            attach: data.attach,
            email: data.email,
            city: data.city,
            country: data.country,
            phone: data.phone,
            role: data.role,
            wallet: data.wallet,
            count: data.count,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            status: data.status,
            location: data.location,
            account: data.account
        }
        return user;
    }
    /**
     * Retorna la lista de todos los usuarios.
     * Valida el usuario.
     * Veririfica que tenga los permisos para obtener la información.
     * @param {object} user
     * @returns 
     */
    static async getAll (user) {

    const users = await Users.find();
    console.log(users);

    if(users.length > 0) return returnDataOrError(users, false, ``);
    return returnDataOrError([], null, `No hay usuarios.`);
}

/**
 * Obtiene un usuario por ID.
 * Recibe el ID del usuario y el ID del board por params.
 * @param {string} id 
 * @returns 
 */
    static async getById (user, id, board = false) {
        /* if(await validatePermission(user, typePermissions.User.getAllUserById)){
            const userId = await Users.findById(id);
            if(!userId) return returnDataOrError([], null, `No existe ningun usuario con ese ID`);

            let response = await ClassUsers.renderUser(userId);
            if(board){
                let logUser = await ClassLog.getLogBySeller(user, id, board);
                response.logs = logUser
            }
            
            if(response) return returnDataOrError(response, null, ``);
            if(response) return returnDataOrError([], null, `No hay un usuario con el Id: ${id}`);
        } */
        
        //if(await validatePermission(user, typePermissions.User.getAllMyUserById)){
            const userDb = await Users.aggregate([
                {
                    $match: { _id: ObjectId(id), id_account: user.id_account }
                },
                {
                    $lookup: {
                        pipeline: [
                            {$project: { password: 0, nit: 0, email: 0, country: 0, address: 0, phone: 0, id_users: 0, id_boards: 0, configuration: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "accounts",
                        localField: "id_account",
                        foreignField: "_id",
                        as: "account"
                    }
                },
                { $unwind: '$account' },
            ]);

            if(userDb.length > 0) {
                let response = await ClassUsers.renderUser(userDb[0]);
                return returnDataOrError(response, null, ``);
            };
            return returnDataOrError([], null, `No se encontro ningún usuario con ese Id`);
        //}
        return returnDataOrError([], null, `No tiene permiso para esta acción`);
    };

    /**
     * Realiza busqueda de vendedores disponibles por Id de pauta. 
     * @param {string} acc id_account
     * @param {string} board id_board
     * @param {int} cpc Valor del cpc
     * @returns 
     */
    static async getByAccountAndBoard(id_pauta){
        let pautaDb = await Pautas.aggregate([
            { $match: { _id: ObjectId(id_pauta) }},
            {
                $lookup: {
                    pipeline: [
                        { $sort: {count: 1, wallet: -1 }},
                        { $project: { city: 0, country: 0, identification_number: 0, address: 0, phone: 0, wallet: 0, location: 0, id_category: 0, password: 0, createdAt: 0, updatedAt: 0, token: 0}},
                    ],
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "users"
                }
            },
        ]); 
        if(pautaDb.length === 0 ) return { messageFailed: `No hay pautas asociadas al id: ${id_pauta}`}
        if(pautaDb[0].status !== 'true' && pautaDb[0].status !== true) return { messageFailed: `La pauta no esta activa`}
        return pautaDb[0];
    }
    /**
     * Entrega el siguiente asesor con disponibilidad de dinero para el click siguiente
     * @param {object} data 
     * @returns 
     */
    static async nextS (data) {
        //Middleware
        // const account = new ClassAccounts(user.id_account);
        // const getAccount = await account.getById();
        // // Validacion de dominio.
        // if(user.url !== getAccount.url.replace(/\/$/, "")){
        //     throw Boom.badRequest( "Dominio no permitido.");
        // }
        // Ordenamiento de los vendedores, con validacion de propiedades.
        
        //Buscar la info por id_pauta
        const pauta = await ClassUsers.getByAccountAndBoard(data.id_pauta);

        if(pauta.messageFailed)  return returnDataOrError([], null, pauta.messageFailed);
        
        if(pauta.users.length > 0){
            let subtractUser = pauta.users[0];
            data.cpc = pauta.cpc;
            pauta.saldo -= data.cpc;
            subtractUser.count += 1; 
            let savedWallet = await Pautas.findByIdAndUpdate(pauta._id, { saldo: pauta.saldo}, {new: true});
            let savedUserCount = await Users.findByIdAndUpdate(subtractUser._id, {count: subtractUser.count}, {new: true});
            
            if(!savedWallet || !savedUserCount) return returnDataOrError([], null, `Error al actualizar`);
            data.id_seller = subtractUser._id;
            data.id_pauta = pauta._id;
            data.id_board = pauta.id_board;
            data.id_account = pauta.id_account;
            const newLead = await ClassLead.create(data);

            let savedLog = await ClassLog.create(subtractUser._id, data.id_board, newLead.response._id, data.cpc, pauta._id);
            if(!savedLog) {
                console.log('Error al guardar la transacción');
            }

            let response = {
                url: `${subtractUser.nickname || subtractUser.name }?attach=${subtractUser.attach}`,
                id_lead: newLead.response._id
            }

            return returnDataOrError(response, null, ``); 
        }
        return returnDataOrError([], null, `A ningún vendedor se le pudo hacer el descuento`);
    }
    
    /**
     * Actualiza un usuario a través de su ID
     * @param {Object} data
     * @param {string} id
     * @returns 
     */
    static async update(id, data, user) {
        if(validatePermission(user, typePermissions.User.updateUser)){
            if(data.wallet || data.password || data.count || data.role){
                return returnDataOrError([], null, `No se puede actualizar este campo`); 
            }
            let updateUser = await Users.findByIdAndUpdate(id, data, { new: true});
            if(updateUser){
                return returnDataOrError([], null, `Se actualizó el usuario`); 
            }
            return returnDataOrError([], null, `No se encontro un usuario con el ID: ${id}`);
        } 
        return returnDataOrError([], null, `No tiene permisos para esta acción`);
    }
    
    /**
     * Elimina un usuario a través de su ID
     * @param {string} id
     * @returns 
     */
    static async delete (user, id) {
        if(await validatePermission(user, typePermissions.User.deleteUser)){
            const userId = await Users.findByIdAndDelete(id);
            if(userId) return returnDataOrError(userId, null, ``); 
            return returnDataOrError([], null, `No se encontro un usuario con el ID: ${id}`);
        }
        return returnDataOrError([], null, `No tiene permisos para esta acción`);
    }

    /**
     * Obtiene un usuario a través de su token
     * @param {string} token
     * @returns 
     */
    static async getByToken(token){
        let user = await Users.findOne({ token: token });
        if(!user) {
            return null;
        }else{
            return user;
        }
    }

    static async confirm(token){
        const data = getTokenData(token)
        if(!data) return returnDataOrError([], null, `No se pudo confirmar su identidad`); 
        const { email, _id } = data.data;
        const user = await Users.findOne({ email })
        const account = await Accounts.findOne({ email })
        user.status = 'active';
        account.status = 'active';
        await user.save();
        await account.save();

        return returnDataOrError([], null, `Cuenta activa.`); 
    }

    static async changePassword({token, password}){
        const data = getTokenData(token);
        const { email, id } = data.data;
        if(!email && !id) return returnDataOrError([], null, `No se pudo confirmar su identidad`); 
        const user = await Users.findOneAndUpdate({ _id: id }, { password: await Users.encryptPassword(password)}, {new: true});
        const account = await Accounts.findOneAndUpdate({ _id: id }, { password: await Users.encryptPassword(password)}, {new: true});

        return returnDataOrError([], null, `Se cambio exitosamente la contraseña.`);
    }

}





module.exports = ClassUsers;
