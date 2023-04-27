const { Schema, model } = require('mongoose');

const TranssactionsSchema = new Schema(
    {
        status: { type: String, trim: true },
        pending: { type: Boolean, trim: true, },
        type: { type: String, required: true, trim: true },
        details: { type: String, required: true, trim: true },
        details_dos: { type: String, trim: true },
        amount: { type: Number, required: true, trim: true },
        id_board: { type: Schema.Types.ObjectId, ref: "Boards" },
        id_user: { type: Schema.Types.ObjectId, ref: "Users" },
        id_campaing: { type: Schema.Types.ObjectId, ref: "Campaigns" },
        id_transsaccion: { type: String },
        data: { type: Object, default: {} }
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Transsactions", TranssactionsSchema);