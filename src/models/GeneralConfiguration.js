const { Schema, model } = require('mongoose');

const GeneralConfigurationSchema = new Schema(
    {
        cpc: { type: Number, default: 500},  
        cost_daily: { type: String, default: 5000}
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);


module.exports = model("general_configuration", GeneralConfigurationSchema);