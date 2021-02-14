const express = require("express");
const router = express.Router();
const org = require("../models/organization");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { findById, find } = require("../models/organization");
const {mail2} = require('../utils/nodemail')
const ejs = require("ejs");
const Review = require("../models/review");
const cryptoRandomString = require('crypto-random-string');
const Token = require("../models/token")

router.get("/show",auth,async (req,res)=>{
    try{
    const user = req.user;
    const getUser = await User.findById(user.userId);
    const city = getUser.city;
    const {category} = req.query;
    let organization;

    if(!category || category == 'both'){
        organization = await org.find({city,category:{$in: ['poor', 'animals']}});
    }else if(category == 'poor' || category == 'animals')
    {
        organization = await org.find({city,category});
        let orz = await org.find({city,category: 'both'});

        for(let i = 0; i<orz.length; i++)
            organization.push(orz[i]);
    }  
    else if( category == 'others')
    {
      organization = await org.find({city,category})
    }
    else
        organization = await org.find();
    
    res.render("biodegradable/show.ejs",{organization,user,category});
    }catch{
        req.flash("error", "Please authenticate first as User");
        res.redirect('/')
    }
})


router.get("/show1",auth,async (req,res)=>{
  try{
    const user = req.user;
    const getUser = await User.findById(user.userId);
    const city = getUser.city;
    const {category,sort} = req.query;
    let organization;

    if(!category || category == 'both')
        organization = await org.find({city}).sort({count:sort});  
    else if(category == 'poor' || category == 'animals')
    {
        organization = await org.find({city,category});
        let orz = await org.find({city,category: 'both'});

        for(let i = 0; i<orz.length; i++)
            organization.push(orz[i]);

            if(sort == 'asc')
            {
              organization.sort(function (a, b) {
                return a.count - b.count;
              });
            }
            else{
              organization.sort(function (a, b) {
                return b.count - a.count;
              });
            }
            
    }  
    else
        organization = await org.find().sort({count:sort});
    
    res.render("biodegradable/show.ejs",{organization,user,category});
  }catch{
      req.flash("error", "Please authenticate first as User");
      res.redirect('/')
  }
})


router.get('/review',auth,(req,res)=>{
  const user = req.user;
  const {q} = req.query;
  res.render("miscellaneous/review",{user,q})
})

router.post('/review/:id',auth,(req,res)=>{
  const id = req.params.id;
  const review = new Review({
    review: req.body.review,
    rating: req.body.rating,
    authororg :{
      id: id
    },
    username: req.body.username
  });
  review.save();
  req.flash("success","Your review is posted")
  res.redirect("/profile/?q="+id);
})

router.get("/success",auth,async(req,res)=>{
    const {id,id2,q} = req.query; 
    
    const t = await Token.findOne({token:q});
    if(t == undefined)
    {
      req.flash("error", "Link expired");
      res.redirect("/");

    }
    else
    {
      await Token.findOneAndDelete({token:q});
      const org = await Org.findById(id);
      const user = await User.findById(id2);
      const data = "You have successfully accepted "+user.name+" request. Close deal when collaboration is done";
      const query= "close";
      host=req.get('host');
      var token = cryptoRandomString({length: 100, type: 'url-safe'});
      const l = new Token({token});
      await l.save();
      link="http://"+req.get('host')+"/biodegradable/closedeal?id="+org._id+"&id2="+user._id+"&q="+token;
      
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
      // res.send("pata nei")
    }
    
})

router.get('/closedeal',async(req,res)=>{
    const {id,id2,q} = req.query;
    
    const t = await Token.findOne({token:q});
    if(t == undefined)
    {
      req.flash("error","Deal has been closed");
      res.redirect("/");
    }
    else
    {
      await Token.findOneAndDelete({token:q});
      const org = await Org.findByIdAndUpdate(id,{$inc: {count:1}});
      const user = await User.findById(id2);
      const data = "Deal is closed "+user.name+". Please provide your valuable review to "+org.name;
      const query= "review";
      host=req.get('host');
      link="http://"+req.get('host')+"/biodegradable/review?q="+org._id;
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
    }
})


module.exports = router;