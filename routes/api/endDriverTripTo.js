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
    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {

            ValidChecks = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);

    if (ValidChecks) {

        if (req.body.tripid == null) {
            res.status(400).send({ error: "tripid", message: "tripid paramter is missing" });
            ValidChecks = false;
            res.end()
        } else if (req.body.actualarrivaltime == null) {
            res.status(400).send({ error: "actualarrivaltime", message: "actualarrivaltime paramter is missing" });
            ValidChecks = false;
            res.end()
        } else if (!((typeof(req.body.actualarrivaltime) === 'string') || ((req.body.actualarrivaltime) instanceof String))) {
            ValidChecks = false;

            res.status(400).send({ error: "actualarrivaltime", message: "actualarrivaltime must be a string" });
            res.end()
        } else if ((req.body.actualarrivaltime).trim().length === 0) {
            ValidChecks = false;
            res.status(400).send({ error: "actualarrivaltime", message: "actualarrivaltime can't be empty" });
            res.end()
        } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(req.body.actualarrivaltime))) {
            res.status(400).send({ error: "actualarrivaltime", message: "actualarrivaltime is unvalid" });
            ValidChecks = false;
            res.end();
        } else if (req.body.distance == null) {
            res.status(400).send({ error: "distance ", message: "distance paramter is missing" });
            ValidChecks = false;
            res.end();

        } else if (!((typeof(parseFloat(req.body.distance)) === 'number'))) {
            res.status(400).send({ error: "distance", message: "distance must be a number" });
            ValidChecks = false;
            res.end();

        } else if (req.body.time == null) {
            res.status(400).send({ error: "Time ", message: "Time paramter is missing" });
            ValidChecks = false;
            res.end();

        } else if (!((typeof(parseFloat(req.body.time)) === 'number'))) {
            res.status(400).send({ error: "Time", message: "Time must be a number" });
            ValidChecks = false;
            res.end();
        } else if (req.body.latitude == null) {
            res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
            ValidChecks = false;
            res.end();
        } else if (((req.body.latitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
            ValidChecks = false;
            res.end();
        } else if (!((typeof(parseFloat(req.body.latitude)) === 'number'))) {
            res.status(400).send({ error: "Latitude", message: "Latitude must be a number" });
            ValidChecks = false;
            res.end();
        } else if (req.body.longitude == null) {
            res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
            ValidChecks = false;
            res.end();
        } else if (((req.body.longitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
            ValidChecks = false;
            res.end();
        } else if (!((typeof(parseFloat(req.body.longitude)) === 'number'))) {
            res.status(400).send({ error: "Longitude", message: "Longitude must be a number" });
            ValidChecks = false;
            res.end();
        }



        if (ValidChecks) {
            const DriverTrip = await DriverDB.findOne({
                where: {
                    driverid: decoded.id,
                    tripid: parseInt(req.body.tripid),
                    status: "ongoing"
                }
            }).catch(errHandler)

            if (DriverTrip) {
                await DriverDB.update({
                    actualarrivaltime: req.body.actualarrivaltime,
                    distance: parseFloat(req.body.distance),
                    time: parseFloat(req.body.time),
                    fare: 0,
                    status: "done"
                }, {
                    where: {
                        driverid: decoded.id,
                        tripid: parseInt(req.body.tripid),
                        status: "ongoing"
                    }
                }).catch(errHandler)

                await Offer.update({
                    status: "done"
                }, {
                    where: {
                        id: DriverTrip.offerid,
                        status: "scheduled"
                    }
                }).catch(errHandler)

                await Trips.update({
                    endloclatitude: parseFloat(req.body.latitude),
                    endloclongitude: parseFloat(req.body.longitude),
                    endtime: req.body.actualarrivaltime,
                    totaldistance: parseFloat(req.body.distance),
                    totaltime: parseFloat(req.body.time),
                    totalfare: 0,
                    status: "done"
                }, {
                    where: {
                        id: parseInt(req.body.tripi),
                        status: "ongoing"
                    }
                })
                res.status(200).send({ message: "Driver trip is updated" })

            } else {
                res.status(404).send({ error: "No driver assigned", message: "No driver assigned" })
                res.end();
            }

        }
    }




})

module.exports = router