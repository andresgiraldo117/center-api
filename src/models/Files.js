const { Schema, model } = require('mongoose');

const FilesSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        route: { type: String, trim: true },
        extension: { type: String,  trim: true },
        size: { type: String, trim: true },
        medialist: { type: String, trim: true },
        id_campaign: { type: Schema.Types.ObjectId, ref: "Campaign" },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);
    
module.exports = model("Files", FilesSchema);