const { Schema, model } = require('mongoose');

const FormLeadsSchema = new Schema(
    {
        status: { type: String, required: true, trim: true, default: 'Active' },
        status_policies: { type: Boolean, required: true, trim: true, default: true },
        name: { type: String, required: true, trim: true },
        lastname: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        phone: { type: Number, required: true, trim: true },
        id_pauta: { type: Schema.Types.ObjectId, ref: "Pautas" },
        id_user: { type: Schema.Types.ObjectId, ref: "Users" },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("FormLeads", FormLeadsSchema);