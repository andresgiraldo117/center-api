const { Schema, model } = require('mongoose');

const NotificationsSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        id_user: { type: Schema.Types.ObjectId, ref: "Users" }, // A quien va dirigido 
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts" },
        status_admin: { type: Boolean, required: true, trim: true, default: false },
        status_user: { type: Boolean, required: true, trim: true, default: false },   
        status_mail: { type: Boolean, required: true, trim: true, default: false },   
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model("Notifications", NotificationsSchema);
