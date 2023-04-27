const { Schema, model } = require('mongoose');

const PautaSchema = new Schema(
    {
        status: { type: String, required: true, trim: true, default: 'Pending' },
        duration: { type: String, required: true, trim: true },
        genre: { type: String, required: true, trim: true },
        initial_budget: { type: Number, required: true, trim: true },
        saldo: { type: Number, trim: true },
        cpc: { type: Number, required: true, trim: true },
        range: { type: Number, required: true, trim: true },
        date_start: { type: String, trim: true },
        date_end: { type: String, trim: true }, //Traer de campaña
        geography: { type: Array, required: true, trim: true },
        id_board: { type: Schema.Types.ObjectId, ref: "Boards", required: true, trim: true },
        id_category: [{ type: String, required: true, trim: true }],
        id_user: { type: Schema.Types.ObjectId, ref: "Users", required: true, trim: true },
        id_campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, trim: true },
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts", trim: true },
        users: [{ type: Schema.Types.ObjectId, ref: "Users", required: true, trim: true }],
        message: { type: String, trim: true },
    },
    { 
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Pautas", PautaSchema);