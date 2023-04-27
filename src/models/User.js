const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        nickname: { type: String, trim: true },
        attach: { type: Number, trim: true },
        identification_number: { type: Number, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        city: { type: String, trim: true },
        country: { type: String, trim: true },
        address: { type: String, trim: true },
        phone: { type: Number, trim: true },
        password: { type: String, required: true, trim: true },
        wallet: { type: Number, trim: true, default: 0 },
        count: { type: Number, trim: true, default: 0 },
        role: { type: String, required: true, trim: true, default: 'seller' },
        token: { type: String, trim: true },
        status: { type: String, required: true, trim: true, default: "pending" },
        location: [{ type: String, trim: true, }],
        id_category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
        id_account: { type: Schema.Types.ObjectId, ref: "Accounts" },
        statusTour: { type: Boolean, required: true, trim: true, default: true },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

userSchema.statics.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
userSchema.statics.comparePassword = async(password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword);
}
module.exports = model("Users", userSchema);