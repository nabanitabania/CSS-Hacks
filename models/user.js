const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        active: { 
            type: Boolean, 
            default: false, 
        },
        created_at: {
            type: Date,
            required: true,
            default: Date.now 
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        city: {
            type: String,
            lowercase: true
        },
        state: {
            type: String
        },
        count: {
            type: Number,
            default: 0
        }

    },
    {
        timestamps: true
    }
)

module.exports = User = mongoose.model("User", userSchema);


