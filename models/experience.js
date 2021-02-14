const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = new Schema(
    {
        image:{
            type: String
        },
        description:{
            type: Number
        },
        authororg:{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        },
        username: {
            type: String
        },
        type :{
            type: string
        },
        created_at: {
            type: Date,
            required: true,
            default: Date.now 
        }
    }
    
)

module.exports = Exp = mongoose.model("Exp", experienceSchema);