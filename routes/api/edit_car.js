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
router.post('/', async(req, res) => {
    var decoded;
    let ValidChecks = true
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized to edit a car" })
        res.end();
    }


    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to edit ya car, your token expired" })
            res.end();
        }
    }).catch(errHandler)


    const options = {};

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

    if (req.body.brand !== undefined && ValidChecks) {
        if (!((typeof(req.body.brand) === 'string') || ((req.body.brand) instanceof String)) || (req.body.brand).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Brand must be a string of (1-300) characters" });
            res.end();
        } else {
            options.brand = req.body.brand
        }
    }
    if (req.body.model !== undefined && ValidChecks) {
        if (!((typeof(req.body.model) === 'string') || ((req.body.model) instanceof String)) || (req.body.model).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Model must be a string of (1-300) characters" });
            res.end();
        } else {
            options.model = req.body.model
        }
    }
    if (req.body.year !== undefined && ValidChecks) {
        if (!((typeof(req.body.year) === 'number')) || ((req.body.year).toString().trim().length !== 4)) {
            ValidChecks = false
            res.status(400).send({ message: "year must be a number of 4 digits" });
            res.end();
        } else {
            options.year = req.body.year
        }
    }
    if (req.body.type !== undefined && ValidChecks) {
        if (!((typeof(req.body.type) === 'string') || ((req.body.type) instanceof String)) || (req.body.type).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Type must be a string of (1-300) characters" });
            res.end();
        } else {
            options.type = req.body.type
        }
    }
    if (req.body.plateletters !== undefined && ValidChecks) {
        if (!((typeof(req.body.plateletters) === 'string') || ((req.body.plateletters) instanceof String)) || (req.body.plateletters).trim().length === 0) {
            ValidChecks = false

            res.status(400).send({ message: "Plateletters must be a string of (1-300) characters" });
            res.end();
        } else {
            options.plateletters = req.body.plateletters
        }
    }
    if (req.body.platenumbers !== undefined && ValidChecks) {
        if (!((typeof(req.body.platenumbers) === 'number') || (req.body.platenumbers).toString().trim().length === 0)) {
            ValidChecks = false
            res.status(400).send({ message: "Plate numbers must be a number of (1-300) digits" });
            res.end();
        } else {
            options.platenumbers = req.body.platenumbers
        }
    }

    if (req.body.nationalid !== undefined && ValidChecks) {
        if (!((typeof(req.body.nationalid) === 'number') || (req.body.nationalid).toString().trim().length === 0)) {
            ValidChecks = false
            res.status(400).send({ message: "National ID must be a number of (1-300) digits" });
            res.end();
        } else {
            options.nationalid = req.body.nationalid
        }
    }
    if (req.body.carlicensefront !== undefined && ValidChecks) {
        if (!((typeof(req.body.carlicensefront) === 'string') || ((req.body.carlicensefront) instanceof String)) || (req.body.carlicensefront).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Car License front must be a string of (1-300) characters" });
            res.end();
        } else {
            options.carlicensefront = req.body.carlicensefront
        }
    }
    if (req.body.carlicenseback !== undefined && ValidChecks) {
        if (!((typeof(req.body.carlicenseback) === 'string') || ((req.body.carlicenseback) instanceof String)) || (req.body.carlicenseback).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Car License back must be a string of (1-300) characters" });
            res.end();
        } else {
            options.carlicenseback = req.body.carlicenseback
        }
    }
    if (req.body.driverlicensefront !== undefined && ValidChecks) {
        if (!((typeof(req.body.driverlicensefront) === 'string') || ((req.body.driverlicensefront) instanceof String)) || (req.body.driverlicensefront).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Driver License front must be a string of (1-300) characters" });
            res.end();

        } else {
            options.driverlicensefront = req.body.driverlicensefront
        }
    }

    if (req.body.driverlicenseback !== undefined && ValidChecks) {
        if (!((typeof(req.body.driverlicenseback) === 'string') || ((req.body.driverlicenseback) instanceof String)) || (req.body.driverlicenseback).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Driver License back must be a string of (1-300) characters" });
            res.end();
        } else {
            options.driverlicenseback = req.body.driverlicenseback
        }
    }
    if (req.body.color !== undefined && ValidChecks) {
        if (!((typeof(req.body.color) === 'string') || ((req.body.color) instanceof String)) || (req.body.color).trim().length === 0) {
            ValidChecks = false
            res.status(400).send({ message: "Color must be a string of (1-300) characters" });
            res.end();
        } else {
            options.color = req.body.color
        }
    }

    if (req.body.numberofseats !== undefined && ValidChecks) {
        if (!((typeof(req.body.numberofseats) === 'number') || (req.body.numberofseats).toString().trim().length === 0)) {
            ValidChecks = false
            res.status(400).send({ message: "Number of seats be a number of (1-300) digits" });
            res.end();

        } else {
            options.numberofseats = req.body.numberofseats
        }
    }

    if (ValidChecks) {
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

            if (updated && Object.keys(options).length > 0) {
                res.status(200).send("Car edited successfully")
                res.end()

            } else {
                res.send("No parameters to be edited")
                res.end()
            }

        } else
            res.status(404).send("User doesn't exist, Please Enter valid ID")
        res.end();
    }
})
module.exports = router;