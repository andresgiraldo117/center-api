const { Schema, model } = require('mongoose');

const LandingSchema = new Schema(
    {
        title_one: { type: String, trim: true },
        title_two: { type: String, trim: true },
        description_one: { type: String, trim: true },
        description_two: { type: String, trim: true },
        services: [{ type: Array, trim: true }],
        id_board: { type: Schema.Types.ObjectId, ref: "Boards" },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

module.exports = model("Landing", LandingSchema);