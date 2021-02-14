const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer  = require('multer')
const {storage} = require("../utils/cloudinary");
const upload = multer({ storage });
const Item = require("../models/items")
const Token = require("../models/token")
const User = require("../models/user")
const {mailtoSeller,mail2} = require('../utils/nodemail')
const cryptoRandomString = require('crypto-random-string');
const ejs = require("ejs");


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
    const {category} = req.query ;
    console.log(q,category)

     let items = []
     items = await Item.find({type:q,Available:true}); 

    if( q != undefined && category == undefined)   //divide into larger subcategories -- metal , cardboards , plastics ...
    {
          //showing all non-biodegradable stuff of specific type
           console.log(items)
           res.render("nonbiodegradable/cardboard",{user,items,category,q}); 
    }
    else 
        res.redirect('/nonbiodegradable')
});


// cardboard page  - GET ROUTE
router.get('/cardboard',auth, async (req,res)=>{
    //filter further
    const user = req.user 
    var currentUser = await User.findById(user.userId)
    const {category} = req.query ;
    const {q} = req.query
    let items = []
    console.log(category,q)
    if(category=='all')
     items =await Item.find({type:q,Available:true});
    else 
    {
       let totalitems =await Item.find({type:q , Available:true});
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
    res.render("nonbiodegradable/cardboard",{user,items,category,q});
})


//upload the specific item - GET ROUTE
router.get("/upload",auth,(req,res)=>{ 
    const user = req.user;
    const items = Item.find();
    res.render("nonbiodegradable/upload",{user,items});
    
});


//upload the specific item - POST ROUTE
router.post("/upload",auth,upload.array('image'),(req, res, next)=>{
    const items = new Item({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.files.map(f => ({url:f.path})),
        type: req.body.type ,
        author: {
            id: req.user.userId,
            username: req.user.name
        }
    });
    items.save();
    console.log(items)
    res.redirect("/nonbiodegradable");
})


//non-biodegradable profile - GET Route
router.get('/item/:id',auth, async (req,res)=>{
    
        var getItem =await  Item.findById(req.params.id)
        var user = req.user;
        var infoOfSeller = await User.findById(getItem.author.id);
        res.render("nonbiodegradable/showProduct",{getItem,user,infoOfSeller})
})

//non-biodegradable profile - POST Route 
router.post('/item/:id', auth , async (req,res) => {
    var msg = req.body.msg;
    const user = req.user;

    if(msg === '')
        res.redirect('/nonbiodegradable/item/'+req.params.id)
    else 
    {
      host=req.get('host');
      var token  = cryptoRandomString({length: 100, type: 'url-safe'});
      const t = new Token({token});
      await t.save();

      var getItem =await  Item.findById(req.params.id)
      var infoOfSeller = await User.findById(getItem.author.id);
            
      link1="http://"+req.get('host')+"/nonbiodegradable/success?id="+infoOfSeller._id+"&id2="+user.userId+"&id3="+getItem._id+"&q="+token;
      link2="http://"+req.get('host')+"/";
      link3="http://"+req.get('host')+"/nonbiodegradable/item/"+getItem._id;
      const query = "";
      ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: msg,user: user,link1,link2,link3,query},async function (err, data) {
        if (err) {
          console.log(err);
        } else {
          try{
            await mailtoSeller(data,infoOfSeller,req.user);
          }catch{
            req.flash("error", "Could not sent mail to "+req.body.email);
            res.redirect('/nonbiodegradable/item/'+req.params.id)
          }
          
        }
        
        });
      
      req.flash("success", "Your mail has been sent to "+req.body.email);
      res.redirect('/nonbiodegradable/item/'+req.params.id)
      console.log("Check email of seller")
    }
    

     
    
     
})

router.get("/success",auth,async(req,res)=>{
    const {id,id2,id3,q} = req.query; 
    
    const t = await Token.findOne({token:q});
    if(t == undefined)
    {
      req.flash("error", "Link expired");
      res.redirect("/");

    }
    else
    {
      await Token.findOneAndDelete({token:q});
      const seller = await User.findById(id);
      const buyer = await User.findById(id2);
      const item = await Item.findById(id3);
      const data = "You have successfully accepted "+buyer.name+" request. Close deal when collaboration is done";
      const query= "close";
      host=req.get('host');
      var token = cryptoRandomString({length: 100, type: 'url-safe'});
      const l = new Token({token});
      await l.save();
      link="http://"+req.get('host')+"/nonbiodegradable/closedeal?id="+buyer._id+"&id2="+item._id+"&q="+token;
      var org = seller;
      ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: data,org,query,link},async function (err, data) {
          if (err) {
            console.log(err);
          } else {
            try{
              await mail2(seller.email ,data);
            }catch{
              req.flash("error", "Could not sent mail to "+seller.email);
              res.redirect('/nonbiodegradable/item/'+item._id)
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
      const buyer = await User.findById(id);
      const item = await Item.findByIdAndUpdate(id2,{Available:false});
      console.log(item)
      const data = "Deal is closed "+buyer.name+". Thanks for using our application. Give your review to improve user experience";
      const query= "review";
      host=req.get('host');
      link="http://"+req.get('host')+"/nonbiodegradable/review";
      const user = buyer;
      ejs.renderFile("./views/miscellaneous/mail.ejs",{msg: data,user,query,link},async function (err, data) {
          if (err) {
            console.log(err);
          } else {
            try{
              await mail2(user.email ,data);
            }catch{
              req.flash("error", "Could not sent mail to "+user.email);
              res.redirect('/');
            }
            
          }
          
      });
      res.redirect("/")
    }
})


module.exports = router;