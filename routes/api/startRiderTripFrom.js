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
const func = require('joi/lib/types/func');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(driverid, tripid, actualpickuptime, res, Test = false) {
    var validationbool = true;

    if (driverid == null) {
        res.status(400).send({ error: "driverid", message: "driverid paramter is missing" });
        validationbool = false;
        res.end()
    } else if (tripid == null) {
        res.status(400).send({ error: "tripid", message: "tripid paramter is missing" });
        validationbool = false;
        res.end()
    } else if (actualpickuptime == null) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime paramter is missing" });
        validationbool = false;
        res.end()
    } else if (!((typeof(actualpickuptime) === 'string') || ((actualpickuptime) instanceof String))) {
        validationbool = false;

        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime must be a string" });
        res.end()
    } else if ((actualpickuptime).trim().length === 0) {
        validationbool = false;
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime can't be empty" });
        res.end()
    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(actualpickuptime))) {
        res.status(400).send({ error: "actualpickuptime", message: "actualpickuptime is unvalid" });
        validationbool = false;
        res.end();
    }
    if (validationbool && Test)
        res.send(validationbool)
    return validationbool;
}

router.post('/', async(req, res) => {


    if (validation(req.body.driverid, req.body.tripid, req.body.actualpickuptime, res)) {
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
module.exports = { router, validation };