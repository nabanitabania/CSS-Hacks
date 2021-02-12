var jwt = require("jsonwebtoken");


const isLoggedIn = (req, res,next) => {
    
    const token = req.cookies.authorization;

    if(token)
    {  
        jwt.verify(token, process.env.JWT_SECRET,(err,user)=>{
            if(err)
                console.log(err);
            else
                req.user = user;
            // console.log(user);
        }); 
    }
    next();  
};


module.exports = isLoggedIn;