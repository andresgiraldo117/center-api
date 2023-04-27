const { Schema, model } = require('mongoose');

const LeadSchema = new Schema(
    {
        name: { type: String,  trim: true },
        ip: { type: String, trim: true },
        city: { type: String,  trim: true },
        country: { type: String,  trim: true },
        email: { type: String,  trim: true },
        phone: { type: String,  trim: true },
        utm: { type: Object, trim: true },
        id_board: { type: Schema.Types.ObjectId, ref: "Boards" },
        id_seller: { type: Schema.Types.ObjectId, ref: "Users" },
        id_pauta: { type: Schema.Types.ObjectId, ref: "Pautas" },
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts" },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);
    
module.exports = model("Lead", LeadSchema);