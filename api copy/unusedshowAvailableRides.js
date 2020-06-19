const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const ExpiredToken = require('../../models/expiredtokens');
const Trips = require('../../models/trips')
const Driver = require('../../models/drivers');

const OfferRideTo = require('../../models/offerrideto');
const OfferRideFrom = require('../../models/offerridefrom');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to show available trips" })
        res.end();
    }
    let isvalid = false
    var ValidChecks = true;
    var availableTrips = {}
    var count = 0;
    var countAll = 0;

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to show available trips" })
            res.end();
        }
    }).catch(errHandler)

    await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        }).then(user => {
            if (user) {

                Trips.findAll({
                    where: {
                        status: "scheduled"

                    }
                }).then(scheduledTrips => {
                    if (scheduledTrips.length > 0) {
                        scheduledTrips.forEach(scheduledTrip => {

                            Driver.findOne({
                                where: {
                                    tripid: scheduledTrip.id


                                }

                            }).then(driverTrip => {
                                if (driverTrip) {

                                    if (driverTrip.tofrom === "to") {
                                        OfferRideTo.findOne({
                                            where: {
                                                id: driverTrip.offerid
                                            }

                                        }).then(offerTrip => {
                                            if (offerTrip) {
                                                countAll++;

                                                if (offerTrip.numberofseats > scheduledTrip.numberofseats) {
                                                    availableTrips[count] = {
                                                        "tripid": scheduledTrip.id,
                                                        "startloclatitude": scheduledTrip.startloclatitude,
                                                        "startloclongitude": scheduledTrip.startloclongitude,
                                                        "endloclatitude": scheduledTrip.endloclatitude,
                                                        "endloclongitude": scheduledTrip.endloclongitude,
                                                        "arrivaltime": offerTrip.arrivaltime,
                                                        "Available seats": offerTrip.numberofseats - scheduledTrip.numberofseats
                                                    }
                                                    count++;



                                                }

                                            }
                                            if (countAll === scheduledTrips.length) {
                                                res.send(availableTrips)
                                            }
                                        }).catch(errHandler)

                                    } else {
                                        //from

                                        OfferRideFrom.findOne({
                                            where: {
                                                id: driverTrip.offerid
                                            }

                                        }).then(offerTrip => {
                                            if (offerTrip) {
                                                countAll++;
                                                if (offerTrip.numberofseats > scheduledTrip.numberofseats) {
                                                    availableTrips[count] = {
                                                        "tripid": scheduledTrip.id,
                                                        "startloclatitude": scheduledTrip.startloclatitude,
                                                        "startloclongitude": scheduledTrip.startloclongitude,
                                                        "endloclatitude": scheduledTrip.endloclatitude,
                                                        "endloclongitude": scheduledTrip.endloclongitude,
                                                        "departuretime": offerTrip.departuretime,
                                                        "Available seats": offerTrip.numberofseats - scheduledTrip.numberofseats
                                                    }
                                                    count++;


                                                }
                                            }
                                            if (countAll === scheduledTrips.length) {
                                                res.send(availableTrips)
                                            }
                                        }).catch(errHandler)

                                    }



                                }

                            }).catch(errHandler)

                        })




                    }

                }).catch(errHandler)


            } else
                res.status(401).send({ error: "User doesn't exist", message: "User doesn't exist" })
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})
module.exports = router;