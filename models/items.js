const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
    {
        name:{
            type: String
        },
        price:{
            type: Number
        },
        description:{
            type: String
        },
        image:[
            {
                url: {
                    type: String
                }
            }
        ],
        type:{
            type: String
        },
        Available :{
            type : Boolean ,
            default : true
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String 
        }
    }
)

module.exports = Item = mongoose.model("Item", itemSchema);