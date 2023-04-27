const { Schema, model } = require('mongoose');

const paymentsSchema = new Schema(
    {
        status: { type: String, required: true, trim: true, default: true },
        method: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, trim: true },
        id_user: { type: Schema.Types.ObjectId, ref: "Users" },
    },
    {
        timestamps: true,
        versionKey: false
    }
);
    
module.exports = model("Payments", paymentsSchema);