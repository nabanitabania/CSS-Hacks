const express = require('express');
const ejs = require("ejs");
const router = express.Router();
const path = require('path');

router.get("/",(req,res)=>{
    res.render("miscellaneous/landing");
  
  });

  module.exports = router;