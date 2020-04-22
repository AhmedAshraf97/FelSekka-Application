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



//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.post('/', (req, res) => {
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to view user profile" })
        res.end();
    }
    User.findOne({
            where: {
                id: decoded.id
            }
        }).then(user => {
            if (user) {
                User.findOne({
                        where: {
                            username: req.body.username
                        }
                    }).then(founduser => {
                        if (founduser) {
                            res.json({
                                firstname: founduser.getDataValue('firstname'),
                                lastname: founduser.getDataValue('lastname'),
                                gender: founduser.getDataValue('gender'),
                                birthdate: founduser.getDataValue('birthdate'),
                                photo: founduser.getDataValue('photo'),
                                ridewith: founduser.getDataValue('ridewith'),
                                smoking: founduser.getDataValue('smoking'),
                                rating: founduser.getDataValue('rating'),
                                username: founduser.getDataValue('username')
                            })
                        } else
                            res.status(404).send({ message: "User not found" })
                    })
                    .catch(errHandler)
            }
        })
        .catch(errHandler)
})


module.exports = router