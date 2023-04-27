const { Schema, model } = require('mongoose');

const LogsSchema = new Schema(
    {
        value: { type: Number, required: true, trim: true },
        id_seller: { type: String, required: true, trim: true },
        id_board: { type: Schema.Types.ObjectId, ref: "Boards" },
        id_seller: { type: Schema.Types.ObjectId, ref: "Users" },
        id_pauta: { type: Schema.Types.ObjectId, ref: "Pautas" },
        id_lead: { type: Schema.Types.ObjectId, ref: "Leads" },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);
    
module.exports = model("Logs", LogsSchema);