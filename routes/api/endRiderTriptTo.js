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
const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');



const ExpiredToken = require('../../models/expiredtokens');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(driverid, tripid, actualarrivaltime, distance, time) {
    var validChecks = true;
    var message;


    if (driverid == null) {
        message = ({ error: "driverid", message: "driverid parameter is missing" });
        validChecks = false;

    } else if (tripid == null) {
        message = ({ error: "tripid", message: "tripid parameter is missing" });
        validChecks = false;

    } else if (actualarrivaltime == null) {
        message = ({ error: "actualarrivaltime", message: "actualarrivaltime parameter is missing" });
        validChecks = false;

    } else if (!((typeof(actualarrivaltime) === 'string') || ((actualarrivaltime) instanceof String))) {
        validChecks = false;
        message = ({ error: "actualarrivaltime", message: "actualarrivaltime must be a string" });

    } else if ((actualarrivaltime).trim().length === 0) {
        validChecks = false;
        message = ({ error: "actualarrivaltime", message: "actualarrivaltime can't be empty" });

    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(actualarrivaltime))) {
        message = ({ error: "actualarrivaltime", message: "actualarrivaltime is unvalid" });
        validChecks = false;;
    } else if (distance == null) {
        validChecks = false;
        message = ({ error: "distance ", message: "distance parameter is missing" });
    } else if (!((typeof(parseFloat(distance)) === 'number'))) {
        validChecks = false;
        message = ({ error: "distance", message: "distance must be a number" });
    } else if (time == null) {
        validChecks = false;
        message = ({ error: "time ", message: "time parameter is missing" });;
    } else if (!((typeof(parseFloat(time)) === 'number'))) {
        validChecks = false;

        message = ({ error: "time", message: "time must be a number" });
    }




    return { validChecks: validChecks, message: message }

}

router.post('/', async(req, res) => {
    var result = validation(req.body.driverid, req.body.tripid, req.body.actualarrivaltime, req.body.distance, req.body.time)
    if (result.validChecks) {

        const DriverTrip = await DriverDB.findOne({
            where: {
                tripid: parseInt(req.body.tripid),
                driverid: parseInt(req.body.driverid),
                status: "ongoing" //////A 
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
                res.status(200).send({ message: "rider trip is updated" })

            } else {
                res.status(404).send({ error: "Rider doesn't exist", message: "Rider doesn't exist" })
                res.end();
            }

        } else {
            res.status(404).send({ error: "Trip doesn't exist", message: "Trip doesn't exist" })
            res.end();
        }
    } else {
        res.status(400).send(result.message)
        res.end()
    }

})
module.exports = { router, validation };