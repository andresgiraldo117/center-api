const Category = require('../models/Category');
const Boards = require('../models/Boards');
const Boom = require('@hapi/boom');
const { validatePermission } = require('../Permissions/Permissions');
const { typePermissions } = require('../Permissions/TypePermissions');
let ObjectId = require('mongoose').Types.ObjectId;
const { returnDataOrError } = require('../middlewares/Response'); 


class ClassCategory {

    static async create(user, data){
        
        if(await validatePermission(user, typePermissions.Category.createCategory)){
            let newCategory = new Category(data); 
            await newCategory.save();
            return returnDataOrError({}, null, `Se creo con exito la Categoria`);
            // return { message: `Se creo con exito la Categoria`, status: 200 };
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        // return { message: `No puede realizar esta acción`, status:200 }
    };

    static async getAll(user){
        if(await validatePermission(user, typePermissions.Category.getAllCategorys)){
            let category = await Category.aggregate([
                {
                    $lookup: {
                        pipeline: [
                            {$project: { id_category_parent: 0, categories_child: 0, id_category_parent: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "categories",
                        localField: "id_category_parent",
                        foreignField: "_id",
                        as: "category_parent"
                    }
                },
                {
                    $lookup: {
                        pipeline: [
                            {$project: { id_category_parent: 0, categories_child: 0, id_category_parent: 0, createdAt:0, updatedAt:0 }},
                        ],
                        from: "categories",
                        localField: "categories_child",
                        foreignField: "_id",
                        as: "category_child"
                    }
                },
                {$project: {id_boards: 0, createdAt: 0, updatedAt: 0}}
            ]);    
            if(category.length === 0) return returnDataOrError({}, null, `No hay categorias`);

            // return { message: `No hay categorias`, status:200 } 
            // throw Boom.notFound(`No hay categorias aún`);
            return returnDataOrError(category, null, ``);
            // return category;
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        // return { message: `No puede realizar esta acción`, status:200 }
        // throw Boom.unauthorized(`No puede realizar esta acción`);
    };

    static async update(user, id, data){
        if(await validatePermission(user, typePermissions.Category.updateCategory)){
            if(data.id_category_parent){
                let category = await Category.findByIdAndUpdate(id, data, {new: true});
                let categoryParent = await Category.findById(data.id_category_parent);
                categoryParent.categories_child = [...categoryParent.categories_child, category._id]
                await categoryParent.save()
            }
            let category = await Category.findByIdAndUpdate(id, data, {new: true});
            if(category) return returnDataOrError({}, null, `Se actualizo con exito`);

            // return { message: 'Se actualizo con exito la Categoria', status: 200 };
            return returnDataOrError({}, null, `No se encontro una categoria con el ID: ${id}`);
            // return { message: `No se encontro una categoria con el ID: ${id}`, status:200 }
            // throw Boom.notFound(`No se encontro una categoria con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        // return { message: `No puede realizar esta acción`, status:200 }
        // throw Boom.unauthorized(`No puede realizar esta acción`);
    };
    
    static async getById(user, id){
        if(await validatePermission(user, typePermissions.Category.getAllCategorysById)){
            let category = await Category.aggregate([
                { $match: { _id: ObjectId(id) }},
                {
                    $lookup: {
                        pipeline: [
                            {$project: {id_account: 0, id_users: 0, createdAt: 0, updatedAt: 0}}
                        ],
                        from: "boards",
                        localField: "id_boards",
                        foreignField: "_id",
                        as: "board"
                    }
                },
                { $unwind: '$board'},
                {$project: {id_boards: 0, createdAt: 0, updatedAt: 0}}
                
            ]);    
            if(category) return returnDataOrError(category, null, ``); 
            // return { status: 200, category };
            return returnDataOrError({}, null, `No se encontro una categoria con el ID: ${id}`);
            // return { message: `No se encontro una categoria con el ID: ${id}`, status:200 }
            // throw Boom.notFound(`No se encontro una categoria con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        // return { message: `No puede realizar esta acción`, status:200 }
        // throw Boom.unauthorized(`No puede realizar esta acción`);
    };
    
    static async delete(user, id){
        if(await validatePermission(user, typePermissions.Category.deleteCategory)){
            let category = await Category.findByIdAndDelete(id);
            if(category) return returnDataOrError(category, null, `Se eliminó con exito`); 
            // return { status: 200, category, message: 'Se eliminó con exito' };
            return returnDataOrError({}, null, `No se encontro una categoria con el ID: ${id}`);
            // return { message: `No se encontro una categoria con el ID: ${id}`, status:200 }
            // throw Boom.notFound(`No se encontro una categoria con el ID: ${id}`);
        }
        return returnDataOrError({}, null, `No puede realizar esta acción`);
        // return { message: `No puede realizar esta acción`, status:200 }
        // throw Boom.unauthorized(`No puede realizar esta acción`);
    };
};

module.exports = ClassCategory;