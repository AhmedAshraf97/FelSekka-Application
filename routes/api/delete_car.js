const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const Car = require('../../models/cars')
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ExpiredToken = require('../../models/expiredtokens');



//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};



router.post('/', async(req, res) => {
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }
    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    await Car.findOne({
        where: {
            id: req.body.carid
        }
    }).then(car => {
        if (!car) {
            ValidChecks = false;
            res.status(404).send({ error: "Car not found", message: "Car not found" })
            res.end()
        }
    }).catch(errHandler)





    await User.findOne({
        where: {
            id: decoded.id,
            status: 'existing'
        }
    }).then(user => {
        if (user) {
            if (ValidChecks) {
                Car.update({
                    status: 'unavailable'
                }, {
                    where: {
                        id: req.body.carid,
                        status: 'existing'
                    }
                }).then(carupdate => {
                    if (carupdate) {
                        res.status(200).send({ message: "Car is deleted" })
                        res.end()
                    }
                }).catch(errHandler)

            }
        } else {
            res.status(404).send({ error: "User not found", message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})

module.exports = router