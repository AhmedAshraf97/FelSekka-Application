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
const Op = Sequelize.Op
const ExpiredToken = require('../../models/expiredtokens');
const {spawn} = require('child_process');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(brand, model, year, type, plateletters, platenumbers, nationalid, carlicensefront, carlicenseback, driverlicensefront, driverlicenseback, color, numberofseats) {
    var validChecks = true
    var message = ""
    if (!((typeof(brand) === 'string') || ((brand) instanceof String)) || (brand).trim().length === 0) {
        validChecks = false
        message = { error: "Brand", message: "Brand must be a string of (1-300) characters" }

    } else if (!((typeof(model) === 'string') || ((model) instanceof String)) || (model).trim().length === 0) {
        validChecks = false
        message = { error: "Model", message: "Model must be a string of (1-300) characters" }

    } else if (((year).trim().length !== 4)) {
        validChecks = false
        message = { error: "Year", message: "year must be a number of 4 digits" }


    } else if (!(/^([0-9]+)$/.test(year))) {
        message = { error: "year", message: "year must be a number" }
        validChecks = false;
    } else if (!((typeof(type) === 'string') || ((type) instanceof String)) || (type).trim().length === 0) {
        validChecks = false
        message = {
            error: "Type",
            message: "Type must be a string of (1-300) characters"
        }
    } else if (((plateletters).trim().length === 0)) {
        validChecks = false
        message = { error: "Plateletters", message: "plateletters cannot be empty" }

    } else if (!(/^[\u0621-\u064A]+$/.test(plateletters))) {
        message = { error: "Plateletters", message: "plateletters must be arabic letters" }
        validChecks = false;
    } else if (((platenumbers).trim().length === 0)) {
        validChecks = false
        message = { error: "Platenumbers", message: "plateletters cannot be empty" }

    } else if (!(/^[\u0660-\u0669]+$/.test(platenumbers))) {
        console.log("OPAAA", platenumbers)
        message = { error: "Platenumbers", message: "platenumbers must be arabic numbers" }
        validChecks = false;
    } else if (((nationalid).trim().length === 0)) {
        validChecks = false
        message = { error: "Nationalid", message: "National ID must be a number of (1-300) digits" }

    } else if (!(/^([0-9]+)$/.test(nationalid))) {
        message = { error: "Nationalid", message: "Nationalid ID must be a number" }
        validChecks = false;
    } else if (!((typeof(carlicensefront) === 'string') || ((carlicensefront) instanceof String)) || (carlicensefront).trim().length === 0) {
        validChecks = false
        message = { error: "Carlicensefront", message: "Car License front must be a string of (1-300) characters" }

    } else if (!((typeof(carlicenseback) === 'string') || ((carlicenseback) instanceof String)) || (carlicenseback).trim().length === 0) {
        validChecks = false

        message = { error: "Carlicenseback", message: "Car License back must be a string of (1-300) characters" }
    } else if (!((typeof(driverlicensefront) === 'string') || ((driverlicensefront) instanceof String)) || (driverlicensefront).trim().length === 0) {
        validChecks = false
        message = { error: "Driverlicensefront", message: "Driver License front must be a string of (1-300) characters" }

    } else if (!((typeof(driverlicenseback) === 'string') || ((driverlicenseback) instanceof String)) || (driverlicenseback).trim().length === 0) {
        validChecks = false
        message = { error: "Driverlicenseback", message: "Driver License back must be a string of (1-300) characters" }

    } else if (!((typeof(color) === 'string') || ((color) instanceof String)) || (color).trim().length === 0) {
        validChecks = false
        message = { error: "Color", message: "Color must be a string of (1-300) characters" }

    } else if (((numberofseats).trim().length === 0)) {
        validChecks = false
        message = { error: "Numberofseats", message: "Number of seats be a number of (1-300) digits" }

    } else if (!(/^([0-9]+)$/.test(numberofseats))) {
        message = { error: "Numberofseats", message: "Numberofseats must be a number" }
        validChecks = false;
    }

    return { validChecks: validChecks, message: message };
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
                var pythonresult;
                const python = spawn('python', ["../../authentication.py",
                req.body.plateletters,
                req.body.platenumbers,
                req.body.carlicensefront
                ]);
                python.stdout.on('data', function (data) {
                pythonresult=data.toString();
                });
                var result = validation(req.body.brand, req.body.model, req.body.year,
                    req.body.type, req.body.plateletters, req.body.platenumbers, req.body.nationalid,
                    req.body.carlicensefront, req.body.carlicenseback, req.body.driverlicensefront,
                    req.body.driverlicenseback, req.body.color, req.body.numberofseats)
                if (result.validChecks) {
                    if(pythonresult==="Letters and digits entered are correct"){
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
                    else if(pythonresult==="Please enter another picture"){
                        res.status(409).send({ error: "Incorrect picture", message: "Please upload another picture" })
                        res.end()
                    }
                    else if(pythonresult==="Letters entered are incorrect"){
                        res.status(409).send({ error: "Incorrect letters", message: "Letters entered are incorrect" })
                        res.end()
                    }
                    else if(pythonresult==="Digits entered are incorrect"){
                        res.status(409).send({ error: "Incorrect digits", message: "Digits entered are incorrect" })
                        res.end()
                    }    
                } else {
                    res.status(400).send(result.message)
                    res.end()
                }
            } else {
                res.status(404).send({ error: "User not found", message: "User not found" })
                res.end()
            }
        }).catch(errHandler)
    }

})

module.exports = { router, validation };