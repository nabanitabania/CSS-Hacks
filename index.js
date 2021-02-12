const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

//.env
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

const mainRoutes = require("./routes/main");
app.use("/",mainRoutes);

app.listen(PORT,()=>{
    console.log("server started at Port " + PORT);
});