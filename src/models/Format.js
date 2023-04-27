const { Schema, model } = require('mongoose');

const FormatSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Format", FormatSchema);