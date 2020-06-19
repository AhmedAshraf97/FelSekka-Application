const User = require('../models/users');
const Review = require('../models/reviews')
const Driver = require('../models/drivers');
const Rider = require('../models/riders');
const Car = require('../models/cars')
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ExpiredToken = require('../models/expiredtokens');



//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    var validChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        validChecks = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            validChecks = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {
            validChecks = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);



    if (validChecks) {

        if (!((typeof(req.body.brand) === 'string') || ((req.body.brand) instanceof String)) || (req.body.brand).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Brand", message: "Brand must be a string of (1-300) characters" });
            res.end();
        }
        if (!((typeof(req.body.model) === 'string') || ((req.body.model) instanceof String)) || (req.body.model).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Model", message: "Model must be a string of (1-300) characters" });
            res.end();
        }
        if (((req.body.year).trim().length !== 4)) {
            validChecks = false
            res.status(400).send({ error: "Year", message: "year must be a number of 4 digits" });
            res.end();
        }
        if (!((typeof(req.body.type) === 'string') || ((req.body.type) instanceof String)) || (req.body.type).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Type", message: "Type must be a string of (1-300) characters" });
            res.end();
        }
        if (!((typeof(req.body.plateletters) === 'string') || ((req.body.plateletters) instanceof String)) || (req.body.plateletters).trim().length === 0) {
            validChecks = false

            res.status(400).send({ error: "Plateletters", message: "Plateletters must be a string of (1-300) characters" });
            res.end();
        }
        if (((req.body.platenumbers).trim().length === 0)) {
            validChecks = false
            res.status(400).send({ error: "Platenumbers", message: "Plate numbers must be a number of (1-300) digits" });
            res.end();
        }

        if (((req.body.nationalid).trim().length === 0)) {
            validChecks = false
            res.status(400).send({ error: "Nationalid", message: "National ID must be a number of (1-300) digits" });
            res.end();
        }

        if (!((typeof(req.body.carlicensefront) === 'string') || ((req.body.carlicensefront) instanceof String)) || (req.body.carlicensefront).trim().length === 0) {
            validChecks = false

            res.status(400).send({ error: "Carlicensefront", message: "Car License front must be a string of (1-300) characters" });
            res.end();
        }
        if (!((typeof(req.body.carlicenseback) === 'string') || ((req.body.carlicenseback) instanceof String)) || (req.body.carlicenseback).trim().length === 0) {
            validChecks = false

            res.status(400).send({ error: "Carlicenseback", message: "Car License back must be a string of (1-300) characters" });
            res.end();
        }

        if (!((typeof(req.body.driverlicensefront) === 'string') || ((req.body.driverlicensefront) instanceof String)) || (req.body.driverlicensefront).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Driverlicensefront", message: "Driver License front must be a string of (1-300) characters" });
            res.end();

        }

        if (!((typeof(req.body.driverlicenseback) === 'string') || ((req.body.driverlicenseback) instanceof String)) || (req.body.driverlicenseback).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Driverlicenseback", message: "Driver License back must be a string of (1-300) characters" });
            res.end();
        }


        if (!((typeof(req.body.color) === 'string') || ((req.body.color) instanceof String)) || (req.body.color).trim().length === 0) {
            validChecks = false
            res.status(400).send({ error: "Color", message: "Color must be a string of (1-300) characters" });
            res.end();
        }

        if (((req.body.numberofseats).trim().length === 0)) {
            validChecks = false
            res.status(400).send({ error: "Numberofseats", message: "Number of seats be a number of (1-300) digits" });
            res.end();

        }
        await User.findOne({
            where: {
                id: decoded.id,
                status: 'existing'
            }
        }).then(user => {
            if (user) {
                if (validChecks) {
                    Car.findOne({
                        where: {
                            plateletters: req.body.plateletters,
                            platenumbers: req.body.platenumbers,
                            status: "existing"
                        }
                    }).then(
                        car => {
                            if (car) {
                                res.status(409).send({ error: "Car information", message: "This Car already exists with same platenumbers and letters" });
                                res.end();
                            } else {
                                Car.create({
                                    userid: user.id,
                                    brand: req.body.brand,
                                    model: req.body.model,
                                    year: parseInt(req.body.year),
                                    type: req.body.type,
                                    plateletters: req.body.plateletters,
                                    platenumbers: req.body.platenumbers,
                                    nationalid: parseInt(req.body.nationalid),
                                    carlicensefront: req.body.carlicensefront,
                                    carlicenseback: req.body.carlicenseback,
                                    driverlicensefront: req.body.driverlicensefront,
                                    driverlicenseback: req.body.driverlicenseback,
                                    color: req.body.color,
                                    numberofseats: parseInt(req.body.numberofseats),
                                    status: 'existing'
                                }).then(created => {
                                    res.status(200).send({ message: "Car is created" })
                                    res.end()
                                }).catch(errHandler)
                            }

                        }

                    ).catch(errHandler)
                }
            } else {
                res.status(404).send({ error: "User not found", message: "User not found" })
                res.end()
            }
        }).catch(errHandler)
    }

})

module.exports = router;