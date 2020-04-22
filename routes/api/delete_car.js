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


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.post('/', async(req, res) => {
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to add a review" })
        res.end();
    }
    await User.findOne({
        where: {
            id: decoded.id
        }
    }).then(user => {
        if (user) {
            Car.update({
                status: 'unavailable'
            }, {
                where: {
                    id: req.body.carid,
                    status: 'existing'
                }
            }).then(car => {
                if (car) {
                    res.status(200).send({ message: "Car is deleted successfully" })
                    res.end()
                } else {
                    res.status(404).send({ message: "Car not found" })
                    res.end()
                }
            }).catch(errHandler)

        } else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})