const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');

router.post('/', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
    let isvalid = false

    User.findOne({
            where: {
                id: decoded.id
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

                    res.redirect('http://www.google.com/');



                }

            } else
                res.status(401).send("User doesn't exist, Please Enter valid ID")
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})
module.exports = router;