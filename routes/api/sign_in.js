const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


//Sign in 
router.post('/', (req, res) => {
    User.findOne({
            where: {
                [Op.or]: [
                    { email: req.body.EmailOrPhone },
                    { phonenumber: req.body.EmailOrPhone }
                ]
            }
        }).then(user => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
                    res.json({ token: token, userInfo: user.dataValues })
                    console.log("User data ", user.dataValues)
                } else
                    res.status(401).send({ message: "Invalid Password, Please try again" })
            } else
                res.status(400).send({ message: "Invalid Email or Phone number, Please try again" })
        })
        .catch(err => {
            console.log('error: ' + err)
        })
})

module.exports = router;