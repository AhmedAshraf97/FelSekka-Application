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

    console.error("Error: ", err);
};






router.post('/', async(req, res) => {
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized to search for trips" })
        res.end();
    }

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
            res.status(401).send({ message: "You aren't authorized to search for trips" })
            res.end();
        }
    }).catch(errHandler)
    if (ValidChecks) {
        await User.findOne({
                where: {
                    id: decoded.id,
                    "status": "existing"
                }
            }).then(user => {
                if (user) {
                    var jsonStr = '{"Trips":[]}';
                    var obj = JSON.parse(jsonStr);

                    const options = {
                        where: {}
                    };

                    options.where.status = "scheduled"
                    if (req.body.tofrom !== undefined)
                        options.where.tofrom = req.body.tofrom;

                    Trips.findAll(options).then(scheduledTrips => {
                        if (scheduledTrips.length > 0) {
                            scheduledTrips.forEach(scheduledTrip => {

                                Driver.findOne({
                                    where: {
                                        tripid: scheduledTrip.id
                                    }
                                }).then(driverTrip => {

                                    if (driverTrip) {

                                        if (driverTrip.tofrom === "to") {
                                            const optionsTo = {
                                                where: {}
                                            };
                                            optionsTo.where.id = driverTrip.offerid
                                            if (req.body.arrivaltime !== undefined)
                                                optionsTo.where.arrivaltime = req.body.arrivaltime;
                                            if (req.body.ridewith !== undefined)
                                                optionsTo.where.ridewith = req.body.ridewith;
                                            if (req.body.smoking !== undefined)
                                                optionsTo.where.smoking = req.body.smoking;
                                            if (req.body.date !== undefined)
                                                optionsTo.where.date = req.body.date;
                                            if (req.body.toorgid !== undefined)
                                                optionsTo.where.toorgid = req.body.toorgid;



                                            OfferRideTo.findOne(optionsTo).then(offerTrip => {
                                                countAll++;
                                                if (offerTrip) {


                                                    if (offerTrip.numberofseats > scheduledTrip.numberofseats) {

                                                        obj['Trips'].push({
                                                            "tripid": scheduledTrip.id,
                                                            "startloclatitude": scheduledTrip.startloclatitude,
                                                            "startloclongitude": scheduledTrip.startloclongitude,
                                                            "endloclatitude": scheduledTrip.endloclatitude,
                                                            "endloclongitude": scheduledTrip.endloclongitude,
                                                            "arrivaltime": offerTrip.arrivaltime,
                                                            "Available seats": offerTrip.numberofseats - scheduledTrip.numberofseats
                                                        })
                                                        count++;

                                                    }

                                                }
                                                if (countAll === scheduledTrips.length) {
                                                    res.status(200).send(obj)

                                                }
                                            }).catch(errHandler)

                                        } else {
                                            //from
                                            const optionsFrom = {
                                                where: {}
                                            };
                                            optionsFrom.where.id = driverTrip.offerid
                                            if (req.body.departuretime !== undefined)
                                                optionsFrom.where.departuretime = req.body.departuretime;
                                            if (req.body.ridewith !== undefined)
                                                optionsFrom.where.ridewith = req.body.ridewith;
                                            if (req.body.smoking !== undefined)
                                                optionsFrom.where.smoking = req.body.smoking;

                                            if (req.body.date !== undefined)
                                                optionsFrom.where.date = req.body.date;
                                            if (req.body.fromorgid !== undefined)
                                                optionsFrom.where.fromorgid = req.body.fromorgid;

                                            OfferRideFrom.findOne(optionsFrom).then(offerTrip => {
                                                countAll++;
                                                if (offerTrip) {


                                                    if (offerTrip.numberofseats > scheduledTrip.numberofseats) {

                                                        obj['Trips'].push({
                                                            "tripid": scheduledTrip.id,
                                                            "startloclatitude": scheduledTrip.startloclatitude,
                                                            "startloclongitude": scheduledTrip.startloclongitude,
                                                            "endloclatitude": scheduledTrip.endloclatitude,
                                                            "endloclongitude": scheduledTrip.endloclongitude,
                                                            "departuretime": offerTrip.departuretime,
                                                            "Available seats": offerTrip.numberofseats - scheduledTrip.numberofseats
                                                        })

                                                        count++;


                                                    }
                                                }

                                                if (countAll === scheduledTrips.length) {
                                                    res.status(200).send(obj)
                                                }
                                            }).catch(errHandler)

                                        }



                                    }

                                }).catch(errHandler)

                            })






                        } else {

                            res.status(409).send("No trips are found")

                        }

                    }).catch(errHandler)

                } else
                    res.status(401).send("User doesn't exist, Please Enter valid ID")
            })
            .catch(err => {
                res.send('error: ' + err)
            })
    }
})
module.exports = router;