const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const AccountsSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type_account: { type: String, required: true, trim: true },
        nit: { type: Number, trim: true },
        password: { type: String, required: true, trim: true },
        document_type: { type: String, trim: true },
        document_number: { type: Number, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        profession: { type: Object, trim: true },
        city: { type: String, trim: true },
        country: { type: String, trim: true },
        address: { type: String, trim: true },
        phone: { type: Number, trim: true },
        id_users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
        id_boards: [{ type: Schema.Types.ObjectId, ref: "Boards" }],
        status: { type: String, required: true, trim: true, default: "active" },
        configuration: { type: Schema.Types.ObjectId, ref: "Configuration_account" },
        commission: { type: String, required: true, trim: true, default: '30%' },
    },
    {
        timestamps: true,
        versionKey: false, 
    }
);

AccountsSchema.statics.encryptPassword = async(password) => {
    //console.log(password)
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
AccountsSchema.statics.comparePassword = async(password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword);
}
    
module.exports = model("Accounts", AccountsSchema);