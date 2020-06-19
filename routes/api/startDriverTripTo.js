const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const Offer = require('../../models/offerrideto')
const Request = require('../../models/requestrideto')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const matching = require('../../matching');
const Trips = require('../../models/trips');
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');
const ExpiredToken = require('../../models/expiredtokens');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(tripid, actualpickuptime, latitude, longitude, res, Test = false) {
    var ValidChecks = true;

    if (tripid == null) {
        res.status(400).send({ error: "tripid", message: "tripid paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (actualpickuptime == null) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (!((typeof(actualpickuptime) === 'string') || ((actualpickuptime) instanceof String))) {
        ValidChecks = false;

        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime must be a string" });
        res.end()
    } else if ((actualpickuptime).trim().length === 0) {
        ValidChecks = false;
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime can't be empty" });
        res.end()
    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(actualpickuptime))) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime is unvalid" });
        ValidChecks = false;
        res.end();
    } else if (latitude == null) {
        res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
        ValidChecks = false;
        res.end();
    } else if (((latitude).toString()).trim().length === 0) {
        res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
        ValidChecks = false;
        res.end();
    } else if (!(/^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$/.test(parseFloat(latitude)))) {
        res.status(400).send({ error: "latitude", message: "latitude must be a number" });
        ValidChecks = false;
        res.end();
    } else if (longitude == null) {
        res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
        ValidChecks = false;
        res.end();
    } else if (((longitude).toString()).trim().length === 0) {
        res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
        ValidChecks = false;
        res.end();
    } else if (!(/^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$/.test(parseFloat(longitude)))) {
        res.status(400).send({ error: "longitude", message: "longitude must be a number" });
        ValidChecks = false;
        res.end();
    }

    if (ValidChecks && Test)
        res.send(validationbool)

    return ValidChecks;

}

router.post('/', async(req, res) => {

    let ValidChecks = true
    let decoded;

    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
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



    if (ValidChecks && validation(req.body.tripid, req.body.actualpickuptime, req.body.latitude, req.body.longitude, res)) {
        const user = await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        }).catch(errHandler)
        if (user) {
            const DriverTrip = await DriverDB.findOne({
                where: {
                    driverid: decoded.id,
                    tripid: parseInt(req.body.tripid),
                    status: "scheduled"
                }
            }).catch(errHandler)

            if (DriverTrip) {
                await DriverDB.update({
                    actualpickuptime: req.body.actualpickuptime,
                    status: "ongoing"
                }, {
                    where: {
                        driverid: decoded.id,
                        tripid: parseInt(req.body.tripid),
                        status: "scheduled"
                    }
                }).catch(errHandler)

                await Offer.update({
                    status: "ongoing"
                }, {
                    where: {
                        id: DriverTrip.offerid,
                        status: "scheduled"
                    }
                }).catch(errHandler)

                await Trips.update({
                    startloclatitude: parseFloat(req.body.latitude),
                    startloclongitude: parseFloat(req.body.longitude),
                    starttime: req.body.actualpickuptime,
                    status: "ongoing"
                }, {
                    where: {
                        id: parseInt(req.body.tripid),
                        status: "scheduled"
                    }
                })
                res.status(200).send({ message: "Driver trip is updated" })

            } else {
                res.status(409).send({ error: "No driver assigned", message: "No driver assigned" })
                res.end();
            }

        } else {
            res.status(404).send({ message: "User doesn't exist" })
            res.end();
        }
    }


})

module.exports = { router, validation }