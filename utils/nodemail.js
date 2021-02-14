const express = require("express");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,           //email id
      pass: process.env.NODEMAILER_PASSWORD       //my gmail password
    }
});


const mail = function(email,link){
        mailOptions={ 
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject : "Please confirm your Email account",
            html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
        }
        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.redirect("/");
            }else{
                console.log("Message sent: " + response.accepted);
            }
        });
}

const mail2 = function(email,data){
    mailOptions={ 
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject : "Please confirm your Email account",
        html : data
    }
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.redirect("/");
        }else{
            console.log("Message sent: " + response.accepted);
        }
    });
}

const mailtoOrg = (senderdata , receiver , data) => {
    mailOptions={ 
        from: senderdata.email,
        to: receiver,
        subject : "Hey , " +senderdata.name+" wants to Collab with Your Organization !",
        html : data
    }
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.accepted);
        }
    });
} 

const mailtoSeller = ( msg , seller , buyer) => {
    mailOptions={ 
        from: buyer.email,
        to: seller.email,
        subject : "Hey " +seller.name+", "+buyer.name+" wants to Buy Junk from You  !",
        html : msg
    }
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.accepted);
        }
    });
} 


module.exports = {mail ,mail2, mailtoOrg , mailtoSeller};