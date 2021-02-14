const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
    {
        token: String
        
    },
    {
        timestamps:true
    }
)

module.exports = Token = mongoose.model("Token", tokenSchema);