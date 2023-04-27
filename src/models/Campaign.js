const { Schema, model } = require('mongoose');

const CampaignSchema = new Schema(
    {
        status: { type: String, trim: true, default: 'Borrador' },
        payment_status: { type: String, trim: true, default: '' },
        name: { type: String, required: true, trim: true },
        url: { type: String, trim: true },
        medialist: { type: String, trim: true },
        id_categories: { type: String, trim: true },
        formato: [{ type: String, trim: true }],
        genre: { type: String, trim: true },
        age: { type: String, trim: true },
        geography: { type: Array, trim: true },
        range: { type: Number, trim: true },
        date_start: { type: String, trim: true },
        date_end: { type: String, trim: true },
        initial_budget: { type: Number, trim: true },
        saldo: { type: Number, trim: true },
        user: { type: Schema.Types.ObjectId, ref: "Users" },
        previous_step: { type: Number, trim: true, default: 1 },
        //id_format: [{ type: Schema.Types.ObjectId, ref: "Format", trim: true }],
        cpc: { type: Number, trim: true }, // set admin
        duration: { type: String, trim: true }, //optional
        message: { type: String, trim: true }, // optional

    },
    { 
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Campaigns", CampaignSchema);
