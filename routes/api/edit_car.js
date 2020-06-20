const User = require('../../models/users');
const org = require('../../models/orgusers');
const betweenusers = require('../../models/betweenusers');
const express = require('express');
const router = express.Router();
const Car = require('../../models/cars')
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const ExpiredToken = require('../../models/expiredtokens');


const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(brand, model, year, type, plateletters, platenumbers, nationalid, carlicensefront,
    carlicenseback, driverlicensefront, driverlicenseback, color, numberofseats) {
    var validChecks = true;
    var message = ""
    const options = {};
    if (brand !== "" && validChecks) {
        if (!((typeof(brand) === 'string') || ((brand) instanceof String)) || (brand).trim().length === 0) {
            validChecks = false
            message = { error: "Brand", message: "Brand must be a string of (1-300) characters" }
        } else {
            options.brand = brand
        }
    }
    if (model !== "" && validChecks) {
        if (!((typeof(model) === 'string') || ((model) instanceof String)) || (model).trim().length === 0) {
            validChecks = false
            message = { error: "Model", message: "Model must be a string of (1-300) characters" }
        } else {
            options.model = model
        }
    }
    if (year !== "" && validChecks) {
        if (!((typeof(parseInt(year)) === 'number')) || ((year).toString().trim().length !== 4)) {
            validChecks = false
            message = { error: "Year", message: "Year must be a number of 4 digits" }
        } else {
            options.year = parseInt(year)
        }
    }
    if (type !== "" && validChecks) {
        if (!((typeof(type) === 'string') || ((type) instanceof String)) || (type).trim().length === 0) {
            validChecks = false
            message = { error: "Type", message: "Type must be a string of (1-300) characters" }
        } else {
            options.type = type
        }
    }
    if (plateletters !== "" && validChecks) {
        if (!((typeof(plateletters) === 'string') || ((plateletters) instanceof String)) || (plateletters).trim().length === 0) {
            validChecks = false
            message = { error: "Plateletters", message: "Plateletters must be a string of (1-300) characters" }
        } else {
            options.plateletters = plateletters
        }
    }
    if (platenumbers !== "" && validChecks) {
        if (!((typeof(parseInt(platenumbers)) === 'number') || (platenumbers).toString().trim().length === 0)) {
            validChecks = false
            message = { error: "Platenumbers", message: "Plate numbers must be a number of (1-300) digits" }
        } else {
            options.platenumbers = parseInt(platenumbers)
        }
    }

    if (nationalid !== "" && validChecks) {
        if (!((typeof(parseInt(nationalid)) === 'number') || (nationalid).toString().trim().length === 0)) {
            validChecks = false
            message = { error: "Nationalid", message: "National ID must be a number of (1-300) digits" }

        } else {
            options.nationalid = parseInt(nationalid)
        }
    }
    if (carlicensefront !== "" && validChecks) {
        if (!((typeof(carlicensefront) === 'string') || ((carlicensefront) instanceof String)) || (carlicensefront).trim().length === 0) {
            validChecks = false
            message = { error: "Carlicensefront", message: "Car License front must be a string of (1-300) characters" }
        } else {
            options.carlicensefront = carlicensefront
        }
    }
    if (carlicenseback !== "" && validChecks) {
        if (!((typeof(carlicenseback) === 'string') || ((carlicenseback) instanceof String)) || (carlicenseback).trim().length === 0) {
            validChecks = false
            message = { error: "Carlicenseback", message: "Car License back must be a string of (1-300) characters" }
        } else {
            options.carlicenseback = carlicenseback
        }
    }
    if (driverlicensefront !== "" && validChecks) {
        if (!((typeof(driverlicensefront) === 'string') || ((driverlicensefront) instanceof String)) || (driverlicensefront).trim().length === 0) {
            validChecks = false
            message = { error: "Driverlicensefront", message: "Driver License front must be a string of (1-300) characters" }

        } else {
            options.driverlicensefront = driverlicensefront
        }
    }

    if (driverlicenseback !== "" && validChecks) {
        if (!((typeof(driverlicenseback) === 'string') || ((driverlicenseback) instanceof String)) || (driverlicenseback).trim().length === 0) {
            validChecks = false
            message = { error: "Driverlicenseback", message: "Driver License back must be a string of (1-300) characters" }
        } else {
            options.driverlicenseback = driverlicenseback
        }
    }
    if (color !== "" && validChecks) {
        if (!((typeof(color) === 'string') || ((color) instanceof String)) || (color).trim().length === 0) {
            validChecks = false
            message = { error: "Color", message: "Color must be a string of (1-300) characters" }
        } else {
            options.color = color
        }
    }

    if (numberofseats !== "" && validChecks) {
        if (!((typeof(parseInt(numberofseats)) === 'number') || (numberofseats).toString().trim().length === 0)) {
            validChecks = false
            message = { error: "Numberofseats", message: "Number of seats be a number of (1-300) digits" }

        } else {
            options.numberofseats = parseInt(numberofseats)
        }
    }
    return { validChecks: validChecks, message: message, options: options }
}
router.post('/', async(req, res) => {
    var ValidChecks = true;

    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }


    await ExpiredToken.findOne({ where: { token: req.headers["authorization"] } }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)


    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {
            ValidChecks = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);


    //const options = {};

    const car = await Car.findOne({
        where: {
            id: req.body.carid,
            status: "existing"
        }

    }).catch(errHandler)

    if (!car) {
        ValidChecks = false;
        res.status(400).send({ message: "You must enter a valid car id" });
        res.end();

    }



    if (ValidChecks) {
        var result = validation(req.body.brand, req.body.model, req.body.year, req.body.type,
            req.body.plateletters, req.body.platenumbers, req.body.nationalid, req.body.carlicensefront,
            req.body.carlicenseback, req.body.driverlicensefront, req.body.driverlicenseback, req.body.color, req.body.numberofseats)
        if (result.validChecks) {
            const options = result.options;

            const user = await User.findOne({
                where: {
                    id: decoded.id,
                    "status": "existing"
                }
            }).catch(errHandler)

            if (user) {
                const updated = await Car.update(options, {
                    where: {
                        userid: decoded.id,
                        id: req.body.carid
                    }
                }).catch(errHandler)

                if (updated[0] === 1 && Object.keys(options).length > 0) {
                    res.status(200).send({ message: "Car edited successfully" })
                    res.end()

                } else {
                    res.status(404).send({ error: "No parameters to be edited", message: "No parameters to be edited" })
                    res.end()
                }

            } else {

                res.status(404).send({ error: "User doesn't exist", message: "User doesn't exist" })
                res.end();
            }
        } else {
            res.status(400).send(result.message);
            res.end();

        }


    }
})
module.exports = { router, validation };