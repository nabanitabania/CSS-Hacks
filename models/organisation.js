const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orgSchema = new Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        contact: {
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
        description: {
            type: String
        },
        category :{
            type: String
        },
        active: { 
            type: Boolean, 
            default: false, 
        },
        count: {
            type: Number,
            default: 0
        },
        created_at: {
            type: Date,
            required: true,
            default: Date.now 
        }
    }
);

module.exports = Org = mongoose.model("Org",orgSchema);