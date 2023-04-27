const Payments = require('../models/Payments');
const Boards = require('../models/Boards');
const Users = require('../models/User');
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
const { returnDataOrError } = require('../middlewares/Response');


class ClassPayments{

    /**
     * Creación de un pago.
     * Verifica que el tablero y usuario al cual se le va a asignar el pago existan.
     * @param {object} user 
     * @param {object} data 
     * @param {string} data.id_user
     * @returns 
     */
    static async create(user, data){
        const foundUser = await Users.findById(user._id);
        if(foundUser){
            let newPayment = {
                method: data.method,
                status: data.status, 
                country: data.country,
                amount: data.amount,
                id_user: foundUser._id
            };
            const payment = new Payments(newPayment);
            const savedPayment = await payment.save();
            foundUser.wallet += savedPayment.amount;
            await foundUser.save();
            
            return returnDataOrError({}, null, `Se realizo el pago exitosamente`);
            // return { message: 'Se realizo el pago exitosamente', status: 200};
        }
        
    };

    /**
     * Método para obtener toda la información de los pagos que haga cada vendedor.
     * @param {object} user 
     * @returns 
     */
    static async getAll(user){
        let payments;
        if(user.role === 'owner'){
            payments = await Payments.find();
            if(payments) return returnDataOrError(payments, null, ``);
            return returnDataOrError({}, null, `No hay pagos`);
            // return payments;
            // return { message: `Aun no hay pagos`, status: 200 };
            // throw new Error('Aun no hay pagos');
        }
        payments = await Payments.aggregate( 
            [
                {
                    $match: { id_user: {$eq: user._id} }
                },
                {
                    $project: {id_user: 0, updatedAt: 0, id_board: 0}
                }
            ]
        );
        if(payments) return returnDataOrError(payments, null, ``);
        return returnDataOrError({}, null, `Aun no ha realizado ninguna recarga`);
        // if(payments) return payments;
        // return { message: `Aun no ha realizado ninguna recarga`, status: 200 };
        // throw Boom.badData('Aun no ha realizado ninguna recarga');

    };

    static async delete(user, id){
        if(user.role === 'owner'){
            const payment = await Payments.findByIdAndDelete(id);
            if(payment) return returnDataOrError(payment, null, `Se elimino el pago.`);
            // return payment;
            return returnDataOrError({}, null, `No hay ningun pago con el Id: ${id}`);
            // return { message: `No hay ningun pago con el Id: ${id}`, status: 200 };
            // throw Boom.notFound('No hay ningun pago con ese ID');
        }
        return returnDataOrError({}, null, `No tiene permisos para esta accion`);
        // return { message: `No tiene permisos para esta accion`, status: 200 };
        // throw Boom.unauthorized('No tiene permisos para esta accion');
    };

    static async update (id, data) {
        try {
            const payment = await Payments.findByIdAndUpdate(id, data, {new: true});
            return payment;
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = ClassPayments;

