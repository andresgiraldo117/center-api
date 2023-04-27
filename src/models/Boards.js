const { Schema, model } = require('mongoose');

const boardsSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, trim: true, default: "" },
        age: { type: String, required: true, trim: true }, 
        url: { type: String, trim: true },  
        typePage: { type: String, trim: true }, // Landing - Ecommerce
        id_users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
        id_categories: [{ type: String }],
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts" },
        status: { type: String, required: true, trim: true, default: "active" },
        landing_status: { type: Boolean, required: true, trim: true, default: true },
        cpc: { type: Number, trim: true, default: 0 }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model("Boards", boardsSchema);