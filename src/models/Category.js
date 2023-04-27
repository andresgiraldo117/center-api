const { Schema, model } = require('mongoose');

const CategorySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        category_parent: { type: String, default: false },
        id_category_parent: { type: Schema.Types.ObjectId, ref: "Category" },
        categories_child: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);
    
module.exports = model("Category", CategorySchema);