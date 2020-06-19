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

    if (req.body.driverid == null) {
        res.status(400).send({ error: "driverid", message: "driverid paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (req.body.tripid == null) {
        res.status(400).send({ error: "tripid", message: "tripid paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (req.body.actualpickuptime == null) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (!((typeof(req.body.actualpickuptime) === 'string') || ((req.body.actualpickuptime) instanceof String))) {
        ValidChecks = false;

        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime must be a string" });
        res.end()
    } else if ((req.body.actualpickuptime).trim().length === 0) {
        ValidChecks = false;
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime can't be empty" });
        res.end()
    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(req.body.actualpickuptime))) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime is unvalid" });
        ValidChecks = false;
        res.end();
    }


    if (ValidChecks) {

        const DriverTrip = await DriverDB.findOne({
            where: {
                driverid: parseInt(req.body.driverid),
                tripid: parseInt(req.body.tripid),
                status: "scheduled"
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
                    actualpickuptime: req.body.actualpickuptime,
                    status: "ongoing"
                }, {
                    where: {
                        tripid: parseInt(req.body.tripid),
                        riderid: parseInt(req.body.riderid),
                        status: "scheduled"
                    }
                }).catch(errHandler)

                await Request.update({
                    status: "ongoing"
                }, {
                    where: {
                        id: RiderTrip.requestid,
                        status: "scheduled"
                    }
                }).catch(errHandler)


                res.status(200).send({ message: "Rider trip is updated" })
            } else {
                res.status(404).send({ error: "Rider doesn't exist", message: "Rider doesn't exist" })
                res.end();

            }

        } else {
            res.status(404).send({ error: "Driver doesn't exist", message: "Driver doesn't exist" })
            res.end();
        }


    }




})
module.exports = router;