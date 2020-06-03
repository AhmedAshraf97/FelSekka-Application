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
const Organization = require('../../models/organizations');
const OfferRideTo = require('../../models/offerrideto');
const OfferRideFrom = require('../../models/offerridefrom');
const Op = Sequelize.Op;
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
        res.status(401).send({ message: "You aren't authorized" })
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
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)
    if (ValidChecks) {
        const user = await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        })

        if (user) {
            var jsonStr = '{"Trips":[]}';
            var obj = JSON.parse(jsonStr);

            const options = {
                where: {}
            };

            options.where.status = "scheduled"
            if (req.body.tofrom !== "")
                options.where.tofrom = req.body.tofrom;
            var scheduledTripsToIDArr = []
            var scheduledTripsFromIDArr = []

            var scheduledTripsToArr = []
            var scheduledTripsFromArr = []


            var offerTripIDToArr = []
            var offerTripIDFromArr = []

            var offerTripToOrgArr = []
            var offerTripFromOrgArr = []

            const scheduledTrips = await Trips.findAll(options).catch(errHandler)



            if (scheduledTrips.length > 0) {
                for (scheduledTrip of scheduledTrips) {
                    if (scheduledTrip.tofrom === "to") {
                        scheduledTripsToIDArr.push(scheduledTrip.id)
                        scheduledTripsToArr.push(scheduledTrip)
                    } else {
                        scheduledTripsFromIDArr.push(scheduledTrip.id)
                        scheduledTripsFromArr.push(scheduledTrip)
                    }


                }
                var scheduledTripsIDArr = scheduledTripsToIDArr.concat(scheduledTripsFromIDArr)

                const driverTrips = await Driver.findAll({
                    where: {
                        tripid: {
                            [Op.in]: scheduledTripsIDArr
                        }

                    }
                }).catch(errHandler)

                for (driverTrip of driverTrips)

                {
                    if (driverTrip.tofrom === "to") {
                        offerTripIDToArr.push(driverTrip.offerid)

                    } else {
                        offerTripIDFromArr.push(driverTrip.offerid)
                    }


                }

                if (offerTripIDToArr.length > 0) {
                    const optionsTo = {
                        where: {
                            id: {
                                [Op.in]: offerTripIDToArr
                            }

                        }
                    };
                    var orgToFlag = 0;
                    if (req.body.arrivaltime !== "")
                        optionsTo.where.arrivaltime = req.body.arrivaltime;
                    if (req.body.ridewith !== "")
                        optionsTo.where.ridewith = req.body.ridewith;
                    if (req.body.smoking !== "")
                        optionsTo.where.smoking = req.body.smoking;
                    if (req.body.date !== "")
                        optionsTo.where.date = req.body.date;
                    if (req.body.toorgid !== "") {
                        optionsTo.where.toorgid = parseInt(req.body.toorgid);
                        offerTripToOrgArr.push(req.body.toorgid)
                    } else {
                        orgToFlag = 1;
                    }

                    const offerTrips = await OfferRideTo.findAll(optionsTo).catch(errHandler)

                    for (offerTrip of offerTrips) {
                        offerTripToOrgArr.push(offerTrip.toorgid)
                    }
                    const orgDetails = await Organization.findAll({
                        where: {

                            id: {
                                [Op.in]: offerTripToOrgArr
                            }

                        }
                    }).catch(errHandler)



                    var index = 0;
                    var orgid, orgname, orglatitude, orglongitude
                    if (orgToFlag === 0) {
                        orgid = offerTrip.toorgid
                        orgname = orgDetails[0].dataValues.name
                        orglatitude = orgDetails[0].dataValues.latitude
                        orglongitude = orgDetails[0].dataValues.longitude
                    }

                    for (offerTrip of offerTrips) {

                        if (offerTrip.numberofseats > scheduledTripsToArr[index].numberofseats) {

                            if (orgToFlag === 1) {
                                orgid = offerTrip.toorgid
                                orgname = orgDetails.find(n => n.dataValues.id = offerTrip.toorgid).name
                                orglatitude = orgDetails.find(n => n.dataValues.id = offerTrip.toorgid).latitude
                                orglongitude = orgDetails.find(n => n.dataValues.id = offerTrip.toorgid).longitude
                            }
                            obj['Trips'].push({
                                "tripid": scheduledTripsToArr[index].id,
                                "startloclatitude": scheduledTripsToArr[index].startloclatitude,
                                "startloclongitude": scheduledTripsToArr[index].startloclongitude,
                                "endloclatitude": scheduledTripsToArr[index].endloclatitude,
                                "endloclongitude": scheduledTripsToArr[index].endloclongitude,
                                "arrivaltime": offerTrip.arrivaltime,
                                "departuretime": "",
                                "Availableseats": offerTrip.numberofseats - scheduledTrip.numberofseats,
                                "date": offerTrip.date,
                                "ridewith": offerTrip.ridewith,
                                "smoking": offerTrip.smoking,
                                "orgid": orgid,
                                "orgname": orgname,
                                "orglatitude": orglatitude,
                                "orglongitude": orglongitude
                            })



                        }
                        index++
                    }


                }
                if (offerTripIDFromArr.length > 0) {
                    const optionsFrom = {
                        where: {
                            id: {
                                [Op.in]: offerTripIDFromArr
                            }

                        }
                    };
                    var orgFromFlag = 0;
                    if (req.body.departuretime !== "")
                        optionsFrom.where.departuretime = req.body.departuretime;
                    if (req.body.ridewith !== "")
                        optionsFrom.where.ridewith = req.body.ridewith;
                    if (req.body.smoking !== "")
                        optionsFrom.where.smoking = req.body.smoking;

                    if (req.body.date !== "")
                        optionsFrom.where.date = req.body.date;
                    if (req.body.fromorgid !== "") {
                        optionsFrom.where.fromorgid = parseInt(req.body.fromorgid);
                        offerTripFromOrgArr.push(req.body.fromorgid)
                    } else {
                        orgFromFlag = 1;
                    }



                    const offerTrips = await OfferRideFrom.findAll(optionsFrom).catch(errHandler)

                    for (offerTrip of offerTrips) {
                        offerTripFromOrgArr.push(offerTrip.fromorgid)
                    }
                    const orgDetails = await Organization.findAll({
                        where: {

                            id: {
                                [Op.in]: offerTripFromOrgArr
                            }

                        }
                    }).catch(errHandler)



                    var index = 0;
                    var orgid, orgname, orglatitude, orglongitude
                    if (orgFromFlag === 0) {
                        orgid = offerTrip.fromorgid
                        orgname = orgDetails[0].dataValues.name
                        orglatitude = orgDetails[0].dataValues.latitude
                        orglongitude = orgDetails[0].dataValues.longitude
                    }

                    for (offerTrip of offerTrips) {

                        if (offerTrip.numberofseats > scheduledTripsFromArr[index].numberofseats) {

                            if (orgFromFlag === 1) {
                                orgid = offerTrip.fromorgid
                                orgname = orgDetails.find(n => n.dataValues.id = offerTrip.fromorgid).name
                                orglatitude = orgDetails.find(n => n.dataValues.id = offerTrip.fromorgid).latitude
                                orglongitude = orgDetails.find(n => n.dataValues.id = offerTrip.fromorgid).longitude
                            }
                            obj['Trips'].push({
                                "tripid": scheduledTripsFromArr[index].id,
                                "startloclatitude": scheduledTripsFromArr[index].startloclatitude,
                                "startloclongitude": scheduledTripsFromArr[index].startloclongitude,
                                "endloclatitude": scheduledTripsFromArr[index].endloclatitude,
                                "endloclongitude": scheduledTripsFromArr[index].endloclongitude,
                                "arrivaltime": "",
                                "departuretime": offerTrip.departuretime,
                                "Availableseats": offerTrip.numberofseats - scheduledTrip.numberofseats,
                                "date": offerTrip.date,
                                "ridewith": offerTrip.ridewith,
                                "smoking": offerTrip.smoking,
                                "orgid": orgid,
                                "orgname": orgname,
                                "orglatitude": orglatitude,
                                "orglongitude": orglongitude
                            })




                        }
                        index++
                    }


                }



                if (obj.Trips.length !== 0) {
                    res.status(200).send(obj)
                } else {
                    res.status(409).send({ error: "No trips are found", message: "No trips are found" })

                }







            } else {

                res.status(409).send({ error: "No trips are found", message: "No trips are found" })

            }

        } else
            res.status(401).send({ message: "User doesn't exist" })
            .catch(err => {
                res.send('error: ' + err)
            })
    }
})
module.exports = router;