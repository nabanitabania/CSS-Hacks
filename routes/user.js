const express = require("express");
const bodyParser = require("body-parser");
const cryptoRandomString = require('crypto-random-string');
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemail = require("../utils/nodemail");



//use of modules
router.use(bodyParser.json());


//new registration
router.get("/register",(req,res)=>{ 
    res.render("register/register",{user:req.user});
});

router.post("/register",async(req,res)=>{
    let getUser;
    try{
        const user = new User({...req.body.user});
        getUser = await user.save();
        
    }
    catch {
        req.flash("error","User already exists");
        res.redirect("/");
    }
    

    if(getUser)
    {
        var rand = cryptoRandomString({length: 100, type: 'url-safe'});
        host=req.get('host');
        link="http://"+req.get('host')+"/user/verify/"+getUser._id+"?tkn="+rand;
        try{
            await nodemail.mail(getUser.email,link);
        }
        catch{
            req.flash("error", "This email address is not correct");
            res.redirect("/");
        }
        
        req.flash("success", "You are registered, an verfication mail has been sent to you");
        res.redirect("/");
    }
    else
    {
        req.flash("error","User already exists");
        res.redirect("/");
    }

    
});


//login 
router.get("/login",(req,res)=>{
    res.render("login/login",{user:req.user});
});

router.post("/login",async (req, res) => {
    
    const getUser = await User.validate(req.body.email,req.body.password);
    
    if(getUser)
    {
        if(getUser.active)
        {
            var token = jwt.sign({name: getUser.name,email: getUser.email,userId: getUser._id,data: 'user'},
                process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            res.cookie( 'authorization', token,{ maxAge: 24*60*60*1000, httpOnly: false });
            req.flash("success", "You are successfully Logged In");
            res.redirect('/');
        }
        else{
            var rand = cryptoRandomString({length: 100, type: 'url-safe'});
            host=req.get('host');
            link="http://"+req.get('host')+"/user/verify/"+getUser._id+"?tkn="+rand;
            
            try{
                await mail(getUser.email,link);
            }
            catch{
                req.flash("error", "This email address is not correct");
                res.redirect("/");
            }
            req.flash("error", "Email not verified, verify your email");
            res.redirect("https://mail.google.com/mail/");
            
        }
    }
    else
    {
        req.flash("error", "Username and password is invalid");
        res.redirect("/");
    }
    
});

//verification of logged user
router.get('/verify/:id',function(req,res){
    
    console.log(host);
        if((req.protocol+"://"+req.get('host'))==("http://"+host))
        {
            console.log("Domain is matched. Information is from Authentic email");
    
            User.findById(req.params.id,function(err,user){
                if(err)
                    console.log(err);
                else
                {
                    date2 = new Date();
                    date1 = user.created_at;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffhrs = Math.ceil(timeDiff / (1000 * 60));
                    console.log(diffhrs);
    
                    if(diffhrs <= 30)
                    {
                        User.findByIdAndUpdate(user._id,{active:true},function(err,user){
                            if(err)
                                console.log(err);
                            else
                            {
                                console.log("email is verified");
                                
                                res.redirect("/");
                            }
                              
                        });
    
                    }
                    else
                    {
                        User.findByIdAndUpdate(user._id,{created_at: new Date()},function(err,user){
                            if(err)
                                console.log(err);   
                        });
                        console.log("Link has expired try logging in to get a new link");
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