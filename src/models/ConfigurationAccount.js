const { Schema, model } = require('mongoose');

const ConfigurationAccountSchema = new Schema(
    {
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts" },
        primary_color: { type: String,  trim: true, default: "#4f4f4f" },
        secondary_color: { type: String,  trim: true, default: "#150050"},
        principal_image: { type: String,},  
        logo: { type: String, }
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);


module.exports = model("Configuration_account", ConfigurationAccountSchema);