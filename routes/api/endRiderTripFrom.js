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
const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');



const ExpiredToken = require('../../models/expiredtokens');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.post('/', async(req, res) => {

    var ValidChecks = true;

    if (req.body.driverid == null) {
        res.status(400).send({ error: "driverid", message: "driverid paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (req.body.tripid == null) {
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
        ValidChecks = false;
        res.status(400).send({ error: "distance ", message: "distance paramter is missing" });
        res.end();
    } else if (!((typeof(req.body.distance) === 'number'))) {
        ValidChecks = false;
        res.status(400).send({ error: "distance", message: "distance must be a number" });
        res.end();
    } else if (req.body.time == null) {
        ValidChecks = false;
        res.status(400).send({ error: "time ", message: "time paramter is missing" });
        res.end();
    } else if (!((typeof(req.body.time) === 'number'))) {
        ValidChecks = false;

        res.status(400).send({ error: "time", message: "time must be a number" });
        res.end();
    } else if (req.body.fare == null) {
        ValidChecks = false;
        res.status(400).send({ error: "fare ", message: "fare paramter is missing" });
        res.end();
    } else if (!((typeof(req.body.fare) === 'number'))) {
        ValidChecks = false;
        res.status(400).send({ error: "fare", message: "fare must be a number" });
        res.end();
    }



    if (ValidChecks) {

        const DriverTrip = await DriverDB.findOne({
            where: {
                tripid: req.body.tripid,
                driverid: req.body.driverid,
                status: "done" //////////////
            }
        }).catch(errHandler)
        if (DriverTrip) {
            const RiderTrip = await RiderDB.findOne({
                where: {
                    riderid: req.body.riderid,
                    tripid: req.body.tripid,
                    status: "ongoing"
                }

            }).catch(errHandler)
            if (RiderTrip) {
                await RiderDB.update({

                    actualarrivaltime: req.body.actualarrivaltime,
                    distance: req.body.distance,
                    time: req.body.time,
                    fare: req.body.fare,
                    status: "done"
                }, {
                    where: {
                        riderid: req.body.riderid,
                        tripid: req.body.tripid,
                        status: "ongoing"
                    }
                }).catch(errHandler)

                await Request.update({
                    status: "done"

                }, {
                    where: {
                        id: RiderTrip.requestid,
                        status: "ongoing"
                    }
                }).catch(errHandler)
                res.status(200).send("Rider trip is updated")

            } else {
                res.status(404).send("Rider doesn't exist")
                res.end();
            }

        } else {
            res.status(404).send("Trip doesn't exist")
            res.end();
        }
    } else {

    }

})
module.exports = router;