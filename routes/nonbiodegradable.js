const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer  = require('multer')
const {storage} = require("../utils/cloudinary");
const upload = multer({ storage });
const Item = require("../models/items")
const User = require("../models/user")
const {mailtoSeller} = require('../utils/nodemail')


//non-biodegrable home page
router.get("/",auth,(req,res)=>{ 
    const user = req.user;
    res.render("nonbiodegradable/nonbiodegradable",{user});
});

//cardboard show - GET Route
router.get("/show",auth,async (req,res)=>{ 
    const {q} = req.query;
    const user = req.user 
    var currentUser = await User.findById(user.userId)
    // console.log(currentUser)
    const {category} = req.query ;
    let items = [] 
    if(category=='all')
     items =await Item.find();
    else 
    {
       let totalitems =await Item.find();
       //console.log(totalitems)
       for(var i=0;i<totalitems.length;i++)
       {
           var x =await User.findById(totalitems[i].author.id)
        //    console.log(x.city,currentUser.city)
          if(x && x.city == currentUser.city){
            //  console.log(totalitems[i]) 
            items.push(totalitems[i])
          }
       } 
    }
    res.render("nonbiodegradable/cardboard",{user,items,category});
});

module.exports = router;