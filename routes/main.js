const express = require('express');
const router = express.Router();
const cryptoRandomString = require('crypto-random-string');
const User = require("../models/user");
const auth = require("../middleware/auth");
const Org = require("../models/organization");
const Token = require("../models/token")
const Item = require("../models/items")
const {mailtoOrg} = require('../utils/nodemail')
const {PythonShell} = require('python-shell');
const ejs = require("ejs");
const multer  = require('multer');
const path = require('path');
const fs = require('fs');
const Review = require('../models/review')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


router.get("/",auth,(req,res)=>{
  
  var user = req.user;
  res.render("miscellaneous/landing",{user,flashMessages: res.locals.flashMessages});

});

//logout
router.get("/logout",function(req,res){
  res.clearCookie('authorization');
  req.flash("success", "You are successfully logged out");
    res.redirect("/");
});

router.get('/profile',auth,async (req,res)=>{
  const user = req.user;
  const {q,id} = req.query;
  const review = await Review.find({'authororg.id':q});
   console.log('profile')
  let getUser;
  try{
    
    if(user.data == 'user')
    {
      if(q){
        getUser = await Org.findById(q);
        //console.log(getUser)
      }else
      {
        if(id)
          getUser = await User.findById(id);
        else
          getUser = await User.findById(user.userId);
      }
    }
    else if(user.data == 'org')
    {
        if(id)
          getUser = await User.findById(id);
        else
        {
          if(q)
            getUser = await Org.findById(q);
          else
            getUser = await Org.findById(user.userId);
        }
    }
    else
      getUser = undefined;

    if(getUser==undefined)
    {
        req.flash("error", "Try logging in");
        res.redirect('/')
    } 
    res.render("profile/profile",{user,getUser,q,id,review,flashMessages: res.locals.flashMessages});
}catch {
  // req.flash("error", "Please authenticate first");
  req.flash("error", "Mongo error");
  res.redirect('/')
}
})

//form function for contacting Organization by a particular user
router.post('/profile',auth,async (req,res)=>{
  //console.log(req.body)  
  //console.log(req.user)
  console.log(req.body)
  const {q} = req.query;
    if(req.body.msg === '')
       res.redirect('/profile?q='+q)
    else 
    {
      host=req.get('host');
      var token  = cryptoRandomString({length: 100, type: 'url-safe'});
      const t = new Token({token});
      await t.save();
            
      link1="http://"+req.get('host')+"/biodegradable/success?id="+req.body.id+"&id2="+req.user.userId+"&q="+token;
      link2="http://"+req.get('host')+"/";
      link3="http://"+req.get('host')+"/profile?id="+req.user.userId;
      const query = "";
      ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: req.body.msg,user: req.user,link1,link2,link3,query},async function (err, data) {
        if (err) {
          console.log(err);
        } else {
          try{
            await mailtoOrg(req.user , req.body.email ,data);
          }catch{
            req.flash("error", "Could not sent mail to "+req.body.email);
            res.redirect('/profile?q='+q);
          }
          
        }
        
        });
      
      req.flash("success", "Your mail has been sent to "+req.body.email);
      res.redirect('/profile?q='+q);
      console.log("Check email of organisation once")
    }
})

router.get("/value/cardboard",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/cardboard",{user});
})
router.get("/value/glass",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/glass",{user});
})
router.get("/value/paper",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/paper",{user});
})
router.get("/value/metal",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/metal",{user});
})
router.get("/value/plastic",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/plastic",{user});
})

router.get("/value",auth,(req,res)=>{
  const user = req.user;
  res.render("ML/upload",{user});
})

router.post('/value',multer({storage}).single('image'),function(req,res,next){
  let dest = "C:\\Users\\Manash's World\\Videos\\Final\\Hacks-css\\uploads" + req.file.filename;
  console.log(dest);
  let output;

  var options = {
    mode: 'text',
    pythonPath: 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Python 3.8\\Python 3.8 (64-bit)',
    scriptPath: "C:\\Users\\Manash's World\\Videos\\Final\\Hacks-css/",
    args: [dest]
    }
  
    PythonShell.run('predict.py',options,(err,results)=>{
      console.log("Shell is running");
        if(err)
          console.log(err);
        else
        {
                          
          output = results[0];
          console.log(output);

          fs.unlink(dest, (err) => {
            if (err) {
              console.error(err)
              return
            }
          
            //file removed
          })

          res.redirect("/value/"+output);
        }
                        
    });
  
  
  
  
  // res.send("pata nei kya hoga");
})


module.exports = router;