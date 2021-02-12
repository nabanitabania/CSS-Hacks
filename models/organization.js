const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

orgSchema.statics.validate = async function(email,password){
    const foundUser = await this.findOne({email});
    console.log(foundUser.password)
    if(foundUser)
    {
        const hash = await bcrypt.compare(password, foundUser.password);
        console.log(hash);
        
        return hash ? foundUser : false;
    }
    return false;
}

orgSchema.pre('save',async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


module.exports = Org = mongoose.model("Org",orgSchema);