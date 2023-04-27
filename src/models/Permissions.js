const { Schema, model } = require('mongoose');

const PermissionsSchema = new Schema(
    {
        nameRole: { type: String, required: true, trim: true },
        listPermissions: [{ type: Object, default: [] }],
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Permissions", PermissionsSchema);