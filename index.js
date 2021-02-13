const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Items = require("./models/items")
const flash = require("connect-flash");
require("dotenv").config();


const PORT = process.env.PORT || 3000;

//Mongoose connection
mongoose.connect(process.env.MONGO_URI,{
	useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false,
    useCreateIndex:true
}).then(()=>console.log('Connected to mongo server'))
	.catch(err => console.error(err));



app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')))

app.use(cookieParser("secret_passcode"));
app.use(session({
  secret: "secret_passcode",
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});





const userRoutes = require("./routes/user");
const orgRoutes = require("./routes/org")
const mainRoutes = require("./routes/main");
const biodegradableRoutes = require("./routes/biodegradable");
const nonbiodegradableRoutes = require("./routes/nonbiodegradable");
app.use("/user",userRoutes);
app.use("/userOrg",orgRoutes);
app.use("/",mainRoutes);
app.use("/biodegradable",biodegradableRoutes);
app.use("/nonbiodegradable",nonbiodegradableRoutes);




app.listen(PORT,()=>{
    console.log("server started at Port " + PORT);
});
