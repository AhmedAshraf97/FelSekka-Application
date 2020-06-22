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


function validation(driverid, tripid, actualpickuptime) {
    var validChecks = true;
    var message;
    if (driverid == null) {
        message = { error: "driverid", message: "driverid parameter is missing" };
        validChecks = false;

    } else if (tripid == null) {
        message = { error: "tripid", message: "tripid parameter is missing" };
        validChecks = false;
    } else if (actualpickuptime == null) {
        message = { error: "actualpickuptime", message: "actualpickuptime parameter is missing" };
        validChecks = false;

    } else if (!((typeof(actualpickuptime) === 'string') || ((actualpickuptime) instanceof String))) {
        validChecks = false;

        message = { error: "actualpickuptime", message: "actualpickuptime must be a string" };
    } else if ((actualpickuptime).trim().length === 0) {
        validChecks = false;
        message = { error: "actualpickuptime", message: "actualpickuptime can't be empty" }
    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(actualpickuptime))) {
        message = { error: "actualpickuptime", message: "actualpickuptime is invalid" };
        validChecks = false;
    }

    return { validChecks: validChecks, message: message }
}

router.post('/', async(req, res) => {

    var result = validation(req.body.driverid, req.body.tripid, req.body.actualpickuptime)
    if (result.validChecks) {

        const DriverTrip = await DriverDB.findOne({
            where: {
                driverid: parseInt(req.body.driverid),
                tripid: parseInt(req.body.tripid),
                status: "ongoing"
            }
        }).catch(errHandler)

        if (DriverTrip) {
            const RiderTrip = await RiderDB.findOne({
                where: {
                    riderid: parseInt(req.body.riderid),
                    tripid: parseInt(req.body.tripid),
                    status: "scheduled"
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


    } else {
        res.status(400).send(result.message)
        res.end()
    }

})
module.exports = { router, validation };