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
    var CarsArray = {}
    var count = 0;
    var ValidChecks = true;
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to show any cars" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to show any cars" })
            res.end();
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

            }
        } else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})

module.exports = router