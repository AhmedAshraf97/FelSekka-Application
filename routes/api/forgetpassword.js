const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
nodeMailer = require('nodemailer')
const ExpiredToken = require('../../models/expiredtokens');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {

    let isvalid = false
    var EmailExists = 0;


    //Password validation
    if (req.body.email === undefined) {


        isvalid = true
        res.status(400).send({ error: "Email password ", message: "Email password is missing" });


    } else if (req.body.email != undefined) {
        await User.findOne({ where: { email: req.body.email } }).then(user => {
            if (user) {
                console.log("ja")
                EmailExists = 1;
            } else {
                res.status(400).send({ error: "Email password ", message: "no such account exits" });

            }

        }).catch(errHandler);
    }






    if (isvalid === false && EmailExists == 1) {
        console.log("farah")

        //res.redirect('http://www.google.com/');
        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,

            auth: {
                // should be replaced with real sender's account
                user: 'farahmostafa97@gmail.com',
                pass: 'xxxx'
            }
        });
        let mailOptions = {
            // should be replaced with real recipient's account
            to: 'farahmostafa97@hotmail.com',
            subject: "hi",
            body: "hi"
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });


    }



})
module.exports = router;