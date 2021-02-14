const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
    {
        review:{
            type: String
        },
        rating:{
            type: Number
        },
        authororg:{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Org"
            }
        },
        username: {
            type: String
        }
    }
)

module.exports = Review = mongoose.model("Review", reviewSchema);