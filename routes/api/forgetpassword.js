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

router.post('/', async(req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
    let isvalid = false
    var ValidChecks = true;

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to delete any car" })
            res.end();
        }
    }).catch(errHandler)
    await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        }).then(user => {
            if (user) {


                //Password validation
                if (req.body.email === undefined) {


                    isvalid = true
                    res.status(400).send({ error: "Email password ", message: "Email password is missing" });


                } else if (req.body.email != user.email) {
                    isvalid = true
                    res.status(400).send({ error: "Email password ", message: "Email password is incorrect" });

                }






                if (isvalid === false) {
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

                    ///////////////////////////////////

                    /////////////////////////////





                }

            } else
                res.status(401).send("User doesn't exist, Please Enter valid ID")
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})
module.exports = router;