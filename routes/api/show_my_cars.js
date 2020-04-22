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
    var CarsArray = {}
    var count = 0;
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to show any cars" })
        res.end();
    }
    await User.findOne({
        where: {
            id: decoded.id
        }
    }).then(user => {
        if (user) {
            Car.findAll({
                where: {
                    userid: user.id,
                    status: 'existing'
                }
            }).then(cars => {
                if (cars.length > 0) {
                    cars.forEach(car => {
                        CarsArray[count] = car.dataValues;
                        count++;
                        if (count === cars.length) {
                            res.send(CarsArray)
                        }
                    });

                } else {
                    res.send({ message: "No Cars to be shown" })
                    res.end()
                }
            }).catch(errHandler)

        } else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})

module.exports = router