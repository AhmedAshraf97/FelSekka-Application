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

function validation(res, brand, model, year, type, plateletters, platenumbers, nationalid, carlicensefront, carlicenseback, driverlicensefront, driverlicenseback, color, numberofseats) {
    var validChecks = true
    if (!((typeof(brand) === 'string') || ((brand) instanceof String)) || (brand).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Brand", message: "Brand must be a string of (1-300) characters" });
        res.end();
    }
    if (!((typeof(model) === 'string') || ((model) instanceof String)) || (model).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Model", message: "Model must be a string of (1-300) characters" });
        res.end();
    }
    if (((year).trim().length !== 4)) {
        validChecks = false
        res.status(400).send({ error: "Year", message: "year must be a number of 4 digits" });
        res.end();
    }
    if (!((typeof(type) === 'string') || ((type) instanceof String)) || (type).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Type", message: "Type must be a string of (1-300) characters" });
        res.end();
    }
    if (!((typeof(plateletters) === 'string') || ((plateletters) instanceof String)) || (plateletters).trim().length === 0) {
        validChecks = false

        res.status(400).send({ error: "Plateletters", message: "Plateletters must be a string of (1-300) characters" });
        res.end();
    }
    if (((platenumbers).trim().length === 0)) {
        validChecks = false
        res.status(400).send({ error: "Platenumbers", message: "Plate numbers must be a number of (1-300) digits" });
        res.end();
    }

    if (((nationalid).trim().length === 0)) {
        validChecks = false
        res.status(400).send({ error: "Nationalid", message: "National ID must be a number of (1-300) digits" });
        res.end();
    }

    if (!((typeof(carlicensefront) === 'string') || ((carlicensefront) instanceof String)) || (carlicensefront).trim().length === 0) {
        validChecks = false

        res.status(400).send({ error: "Carlicensefront", message: "Car License front must be a string of (1-300) characters" });
        res.end();
    }
    if (!((typeof(carlicenseback) === 'string') || ((carlicenseback) instanceof String)) || (carlicenseback).trim().length === 0) {
        validChecks = false

        res.status(400).send({ error: "Carlicenseback", message: "Car License back must be a string of (1-300) characters" });
        res.end();
    }

    if (!((typeof(driverlicensefront) === 'string') || ((driverlicensefront) instanceof String)) || (driverlicensefront).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Driverlicensefront", message: "Driver License front must be a string of (1-300) characters" });
        res.end();

    }

    if (!((typeof(driverlicenseback) === 'string') || ((driverlicenseback) instanceof String)) || (driverlicenseback).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Driverlicenseback", message: "Driver License back must be a string of (1-300) characters" });
        res.end();
    }


    if (!((typeof(color) === 'string') || ((color) instanceof String)) || (color).trim().length === 0) {
        validChecks = false
        res.status(400).send({ error: "Color", message: "Color must be a string of (1-300) characters" });
        res.end();
    }

    if (((numberofseats).trim().length === 0)) {
        validChecks = false
        res.status(400).send({ error: "Numberofseats", message: "Number of seats be a number of (1-300) digits" });
        res.end();

    }
    return validChecks;
}
router.post('/', async(req, res) => {
    var decoded;
    var validChecks1 = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        validChecks1 = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            validChecks1 = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {
            validChecks1 = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);



    if (validChecks1) {


        await User.findOne({
            where: {
                id: decoded.id,
                status: 'existing'
            }
        }).then(user => {
            if (user) {
                if (validation(res, req.body.brand, req.body.model, req.body.year, req.body.type, req.body.plateletters, req.body.platenumbers, req.body.nationalid, req.body.carlicensefront, req.body.carlicenseback, req.body.driverlicensefront, req.body.driverlicenseback, req.body.color, req.body.numberofseats)) {
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

module.exports = { router, validation };