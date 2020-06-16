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
        res.status(400).send({ error: "Distance ", message: "Distance paramter is missing" });
        res.end();
    } else if (!((typeof(parseFloat(req.body.distance)) === 'number'))) {
        ValidChecks = false;
        res.status(400).send({ error: "Distance", message: "Distance must be a number" });
        res.end();
    } else if (req.body.time == null) {
        ValidChecks = false;
        res.status(400).send({ error: "Time ", message: "Time paramter is missing" });
        res.end();
    } else if (!((typeof(parseFloat(req.body.time)) === 'number'))) {
        ValidChecks = false;

        res.status(400).send({ error: "Time", message: "Time must be a number" });
        res.end();
    }



    if (ValidChecks) {

        const DriverTrip = await DriverDB.findOne({
            where: {
                tripid: parseInt(req.body.tripid),
                driverid: parseInt(req.body.driverid),
                status: "done" //////////////
            }
        }).catch(errHandler)
        if (DriverTrip) {
            const RiderTrip = await RiderDB.findOne({
                where: {
                    riderid: parseInt(req.body.riderid),
                    tripid: parseInt(req.body.tripid),
                    status: "ongoing"
                }

            }).catch(errHandler)
            if (RiderTrip) {
                await RiderDB.update({

                    actualarrivaltime: req.body.actualarrivaltime,
                    distance: parseFloat(req.body.distance),
                    time: parseFloat(req.body.time),
                    fare: 0,
                    status: "done"
                }, {
                    where: {
                        riderid: parseInt(req.body.riderid),
                        tripid: parseInt(req.body.tripid),
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
                res.status(200).send({ message: "Rider trip is updated" })

            } else {
                res.status(404).send({ error: "Rider doesn't exist", message: "Rider doesn't exist" })
                res.end();
            }

        } else {
            res.status(404).send({ error: "Trip doesn't exist", message: "Trip doesn't exist" })
            res.end();
        }
    } else {

    }

})
module.exports = router;