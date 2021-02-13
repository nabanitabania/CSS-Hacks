const express = require("express");
const router = express.Router();
const org = require("../models/organization");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { findById, find } = require("../models/organization");
const {mail2} = require('../utils/nodemail')
const ejs = require("ejs");

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


router.get("/success",async(req,res)=>{
    const {id,id2} = req.query; 
    const org = await Org.findById(id);
    const user = await User.findById(id2);
    const data = "You have successfully accepted "+user.name+" request. Close deal when collaboration is done";
    const query= "close";
    host=req.get('host');
    link="http://"+req.get('host')+"/biodegradable/closedeal?id="+org._id+"&id2="+user._id;
    ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: data,org,query,link},async function (err, data) {
        if (err) {
          console.log(err);
        } else {
          try{
            await mail2(org.email ,data);
          }catch{
            req.flash("error", "Could not sent mail to "+org.email);
            res.redirect('/profile?q='+q);
          }
          
        }
        
    });
    req.flash("success", "Successfully collaborated check your mail");
    res.redirect("/")
})

router.get('/closedeal',async(req,res)=>{
    const {id,id2} = req.query;
    const org = await Org.findByIdAndUpdate(id,{$inc: {count:1}});
    const user = await User.findById(id2);
    const data = "Deal is closed "+user.name+". Please provide your valuable review to "+org.name;
    const query= "review";
    host=req.get('host');
    link="http://"+req.get('host')+"/profile?iq="+org._id+"&r=review";
    ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: data,user,query,link},async function (err, data) {
        if (err) {
          console.log(err);
        } else {
          try{
            await mail2(user.email ,data);
          }catch{
            req.flash("error", "Could not sent mail to "+user.email);
            res.redirect('/profile?q='+q);
          }
          
        }
        
    });
    res.redirect("/profile?q="+id)
})


module.exports = router;