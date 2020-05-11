const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const Offer = require('../../models/offerridefrom')
const Request = require('../../models/requestridefrom')
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

    } else if (!((typeof(req.body.distance) === 'number'))) {
        res.status(400).send({ error: "distance", message: "distance must be a number" });
        ValidChecks = false;
        res.end();

    } else if (req.body.time == null) {
        res.status(400).send({ error: "time ", message: "time paramter is missing" });
        ValidChecks = false;
        res.end();

    } else if (!((typeof(req.body.time) === 'number'))) {
        res.status(400).send({ error: "time", message: "time must be a number" });
        ValidChecks = false;
        res.end();
    } else if (req.body.fare == null) {
        res.status(400).send({ error: "fare ", message: "fare paramter is missing" });
        ValidChecks = false;
        res.end();
    } else if (!((typeof(req.body.fare) === 'number'))) {
        res.status(400).send({ error: "fare", message: "fare must be a number" });
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
    } else if (!((typeof(req.body.latitude) === 'number'))) {
        res.status(400).send({ error: "latitude", message: "latitude must be a number" });
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
    } else if (!((typeof(req.body.longitude) === 'number'))) {
        res.status(400).send({ error: "longitude", message: "longitude must be a number" });
        ValidChecks = false;
        res.end();
    }


    if (ValidChecks) {
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
                    tripid: req.body.tripid,
                    status: "ongoing"
                }
            }).catch(errHandler)

            if (DriverTrip) {
                await DriverDB.update({
                    actualarrivaltime: req.body.actualarrivaltime,
                    distance: req.body.distance,
                    time: req.body.time,
                    fare: req.body.fare,
                    status: "done"
                }, {
                    where: {
                        driverid: decoded.id,
                        tripid: req.body.tripid,
                        status: "ongoing"
                    }
                }).catch(errHandler)

                await Offer.update({
                    status: "done"
                }, {
                    where: {
                        id: DriverTrip.offerid,
                        status: "ongoing"
                    }
                }).catch(errHandler)

                await Trips.update({
                    endloclatitude: req.body.latitude,
                    endloclongitude: req.body.longitude,
                    endtime: req.body.actualarrivaltime,
                    totaldistance: req.body.distance,
                    totaltime: req.body.time,
                    totalfare: req.body.fare,
                    status: "done"
                }, {
                    where: {
                        id: req.body.tripid,
                        status: "ongoing"
                    }
                })
                res.status(200).send("Driver trip is updated")

            } else {
                res.status(404).send("No driver assigned with this trip")
                res.end();
            }

        } else {
            res.status(404).send("User doesn't exist, Please Enter valid ID")
            res.end();
        }
    }




})

module.exports = router