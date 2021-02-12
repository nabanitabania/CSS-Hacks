const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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
        },
        profile: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.statics.validate = async function(email,password){
    const foundUser = await this.findOne({email});

    if(foundUser)
    {
        const hash = await bcrypt.compare(password, foundUser.password);
        return hash ? foundUser : false;
    }
    return false;
}

userSchema.pre('save',async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    next();
})



module.exports = User = mongoose.model("User", userSchema);