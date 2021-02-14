const express = require("express");
const bodyParser = require("body-parser");
const cryptoRandomString = require('crypto-random-string');
const cookieParser = require('cookie-parser');
const router = express.Router();
const Org = require("../models/organization");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const flash = require('connect-flash');
const nodemail = require("../utils/nodemail");
const { async } = require("crypto-random-string");
const { findById } = require("../models/organization");




//use of modules
router.use(bodyParser.json());
router.use(cookieParser('secret_passcode'));
router.use(bodyParser.urlencoded({extended:true}));
router.use(flash());
router.use(session({
    secret: "secret_passcode",
    cookie: {
      maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
  }));
router.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next();
});


//new registration
router.get("/register",(req,res)=>{ 
    res.render("register/registerOrg",{user:req.user});
});

router.post("/register",async(req,res)=>{
    
    const user = new Org({...req.body.Org});
    // console.log(user)
    Org.findOne({})

    const getUser = await user.save();

    if(getUser)
    {
        var rand = cryptoRandomString({length: 100, type: 'url-safe'});
        host=req.get('host');
        link="http://"+req.get('host')+"/userOrg/verify/"+getUser._id+"?tkn="+rand;
        await nodemail.mail(getUser.email,link);
    }
    else
    {
        console.log("mongo error")
    }

    res.redirect("/");
});


//login 
router.get("/login",(req,res)=>{
    res.render("login/loginOrg",{user:req.user});
});

router.post("/login",async (req, res) => {
    
    const getUser = await Org.validate(req.body.email,req.body.password);
    var error = [];
    if(getUser)
    {
        if(getUser.active)
        {
            var token = jwt.sign({name: getUser.name,email: getUser.email,userId: getUser._id,data:'org'},
                process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            res.cookie( 'authorization', token,{ maxAge: 24*60*60*1000, httpOnly: false });
           res.redirect('/');
        }
        else{
            var rand = cryptoRandomString({length: 100, type: 'url-safe'});
            host=req.get('host');
            link="http://"+req.get('host')+"/userOrg/verify/"+getUser._id+"?tkn="+rand;
            try{
                await mail(getUser.email,link);
            }
            catch{
                req.flash("error", "This email address is not correct");
                res.redirect("/");
            }
            res.redirect("https://mail.google.com/mail/");
            console.log("verify your email");
        }
    }
    else{
         req.flash('error','Username or Password Invalid !')  
        res.redirect("/");
    }
    
});

//verification of logged user
router.get('/verify/:id',function(req,res){
    
    console.log(host);
        if((req.protocol+"://"+req.get('host'))==("http://"+host))
        {
            console.log("Domain is matched. Information is from Authentic email");
    
            Org.findById(req.params.id,function(err,user){
                if(err)
                    console.log(err);
                else
                {
                    date2 = new Date();
                    date1 = user.created_at;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffhrs = Math.ceil(timeDiff / (1000 * 60));
                    console.log(diffhrs);
    
                    if(diffhrs <= 1)
                    {
                        Org.findByIdAndUpdate(user._id,{active:true},function(err,user){
                            if(err)
                                console.log(err);
                            else
                            {
                                console.log("email is verified");
                                //req.flash('success_msg','You are now registered !')  
                                res.redirect("/");
                            }
                              
                        });
    
                    }
                    else
                    {
                        Org.findByIdAndUpdate(user._id,{created_at: new Date()},function(err,user){
                            if(err)
                                console.log(err);   
                        });
                        console.log("Link has expired try logging in to get a new link");
                        req.flash('error_msg','Something went Wrong !')  
                        res.redirect("/user/login");
                    }
                }
            });
        }
        else
        {
            res.end("<h1>Request is from unknown source");
        }
    });



module.exports = router;