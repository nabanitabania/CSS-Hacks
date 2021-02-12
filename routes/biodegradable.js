const express = require("express");
const router = express.Router();
const org = require("../models/organization");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { findById, find } = require("../models/organization");



router.get("/show",auth,async (req,res)=>{
    try{
    const user = req.user;
    const getUser = await User.findById(user.userId);
    const city = getUser.city;
    const {category} = req.query;
    let organization;

    if(!category || category == 'both')
        organization = await org.find({city});  
    else if(category == 'poor' || category == 'animals')
    {
        organization = await org.find({city,category});
        let orz = await org.find({city,category: 'both'})

        for(let i = 0; i<orz.length; i++)
            organization.push(orz[i]);
    }  
    else
        organization = await org.find();
    
    res.render("biodegradable/show.ejs",{organization,user,category});
    }catch{
        req.flash("error", "Please authenticate first as User");
        res.redirect('/')
    }
})


module.exports = router;