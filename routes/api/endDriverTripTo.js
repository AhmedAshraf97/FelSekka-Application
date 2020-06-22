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
const TripActualFare = require('../../ActualFareCalc')

const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

var driver = {};
var RidersinTrip = {};


function validation(tripid, actualarrivaltime, distance, time, latitude, longitude) {
    var validChecks = true;
    var message;

    if (tripid == null) {
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
        validChecks = false;

    } else if (distance == null) {
        message = ({ error: "distance ", message: "distance parameter is missing" });
        validChecks = false;


    } else if (!((typeof(parseFloat(distance)) === 'number'))) {
        message = ({ error: "distance", message: "distance must be a number" });
        validChecks = false;


    } else if (time == null) {
        message = ({ error: "Time ", message: "Time parameter is missing" });
        validChecks = false;


    } else if (!((typeof(parseFloat(time)) === 'number'))) {
        message = ({ error: "Time", message: "Time must be a number" });
        validChecks = false;

    } else if (latitude == null) {
        message = ({ error: "Latitude", message: "Latitude parameter is missing" });
        validChecks = false;

    } else if (((latitude).toString()).trim().length === 0) {
        message = ({ error: "Latitude", message: "Latitude can't be empty" });
        validChecks = false;

    } else if (!((typeof(parseFloat(latitude)) === 'number'))) {
        message = ({ error: "Latitude", message: "Latitude must be a number" });
        validChecks = false;

    } else if (longitude == null) {
        message = ({ error: "Longitude", message: "Longitude parameter is missing" });
        validChecks = false;

    } else if (((longitude).toString()).trim().length === 0) {
        message = ({ error: "Longitude", message: "Longitude can't be empty" });
        validChecks = false;

    } else if (!((typeof(parseFloat(longitude)) === 'number'))) {
        message = ({ error: "Longitude", message: "Longitude must be a number" });
        validChecks = false;

    }

    return { validChecks: validChecks, message: message }
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
    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {

            ValidChecks = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);

    if (ValidChecks) {
        var result = validation(req.body.tripid, req.body.actualarrivaltime,
            req.body.distance, req.body.time, req.body.latitude, req.body.longitude);

        if (result.validChecks) {
            const DriverTrip = await DriverDB.findOne({
                where: {
                    driverid: decoded.id,
                    tripid: parseInt(req.body.tripid),
                    status: "ongoing"
                }
            }).catch(errHandler)

            if (DriverTrip) {


                RidersinTrip = await RiderDB.findAll({
                    where: {
                        tripid: parseInt(req.body.tripid),
                        status: "done"
                    }
                })

                driver = { fare: 0, distance: parseFloat(req.body.distance), time: parseFloat(req.body.time) }

                var p = await TripActualFare('./routes/api/endDriverTripTo');

                await DriverDB.update({
                    actualarrivaltime: req.body.actualarrivaltime,
                    distance: parseFloat(req.body.distance),
                    time: parseFloat(req.body.time),
                    fare: driver.fare,
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
                        status: "ongoing"
                    }
                }).catch(errHandler)



                var totalFare = 0;

                for (rider of RidersinTrip) {
                    totalFare += rider.fare;
                    await RiderDB.update({
                        fare: rider.fare
                    }, {
                        where: {
                            riderid: rider.riderid,
                            tripid: parseInt(req.body.tripid)
                        }
                    }).catch(errHandler)
                }

                await Trips.update({
                    endloclatitude: parseFloat(req.body.latitude),
                    endloclongitude: parseFloat(req.body.longitude),
                    endtime: req.body.actualarrivaltime,
                    totaldistance: parseFloat(req.body.distance),
                    totaltime: parseFloat(req.body.time),
                    totalfare: totalFare,
                    status: "done"
                }, {
                    where: {
                        id: parseInt(req.body.tripid),
                        status: "ongoing"
                    }
                })
                res.status(200).send({ message: "Driver trip is updated" })

            } else {
                res.status(404).send({ error: "No driver assigned", message: "No driver assigned" })
                res.end();
            }

        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }


    driver = {};
    RidersinTrip = {};
})

function getters() {
    return {
        driver,
        RidersinTrip
    };
}

module.exports = { router, validation, getters }