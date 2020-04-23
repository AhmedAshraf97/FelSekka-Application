const User = require('../../models/users');
const Trips = require('../../models/trips')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');

const RequestRideFrom = require('../../models/requestridefrom');
const RequestRideTo = require('../../models/requestrideto');

const OfferRideFrom = require('../../models/offerridefrom');
const OfferRideTo = require('../../models/offerrideto');
const Car = require('../../models/cars');



const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var TripsDetailsArr = {}
    var count = 0
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to view user past trips" })
        res.end();
    }


    await User.findOne({
        where: {
            id: decoded.id
        }
    }).then(user => {
            if (user) {
                Rider.findAll({
                    where: {
                        riderid: decoded.id,
                        status: "done"
                    }
                }).then(RiderRides => {
                    console.log("here1")

                    if (RiderRides.length > 0) {
                        console.log("here2", RiderRides)

                        RiderRides.forEach(RiderRide => {
                            console.log("here3")

                            if (RiderRide) {

                                Trips.findOne({
                                    where: {
                                        id: RiderRide.tripid

                                    }
                                }).then(trip => {


                                    if (RiderRide.tofrom === "to") {
                                        RequestRideTo.findOne({
                                            where: {
                                                id: RiderRide.requestid

                                            }
                                        }).then(RequestRideToDetails => {

                                                OfferRideTo.findOne({
                                                    where: {
                                                        id: RiderRide.offerid

                                                    }
                                                }).then(OfferRideToDetails => {
                                                    Car.findOne({
                                                        where: {
                                                            id: OfferRideToDetails.carid

                                                        }
                                                    }).then(carDetails => {

                                                        TripsDetailsArr[count] = ({
                                                            "carDetails.model": carDetails.model,
                                                            "carDetails.brand": carDetails.brand,
                                                            "pickuplongitude": RequestRideToDetails.fromlongitude,
                                                            "pickuplatitude": RequestRideToDetails.fromlatitude,
                                                            type: "Rider",
                                                            "date": trip.date,
                                                            "starttime": trip.starttime,

                                                            "actualpickuptime": RiderRide.actualpickuptime,
                                                            "actualarrivaltime": RiderRide.actualarrivaltime,
                                                            "fare": RiderRide.fare,
                                                            "total time": RiderRide.time
                                                        })
                                                        count++;
                                                        if (count === RiderRides.length) {
                                                            console.log("COUNT", count)
                                                            res.send(TripsDetailsArr)
                                                        }




                                                    }).catch(errHandler)



                                                }).catch(errHandler)


                                            }



                                        ).catch(errHandler)


                                    } else {
                                        //to

                                        RequestRideTo.findOne({
                                            where: {
                                                id: RiderRide.requestid

                                            }
                                        }).then(RequestRideFromDetails => {

                                                OfferRideFrom.findOne({
                                                    where: {
                                                        id: RiderRide.offerid

                                                    }
                                                }).then(OfferRideFromDetails => {
                                                    Car.findOne({
                                                        where: {
                                                            id: OfferRideFromDetails.carid

                                                        }
                                                    }).then(carDetails => {

                                                        TripsDetailsArr[count] = ({
                                                            "carDetails.model": carDetails.model,
                                                            "carDetails.brand": carDetails.brand,
                                                            "pickuplongitude": RequestRideFromDetails.fromlongitude,
                                                            "pickuplatitude": RequestRideFromDetails.fromlatitude,
                                                            type: "Rider",
                                                            "date": trip.date,
                                                            "starttime": trip.starttime,

                                                            "actualpickuptime": RiderRide.actualpickuptime,
                                                            "actualarrivaltime": RiderRide.actualarrivaltime,
                                                            "fare": RiderRide.fare,
                                                            "total time": RiderRide.time
                                                        })
                                                        count++;
                                                        if (count === RiderRides.length) {
                                                            console.log("COUNT", count)
                                                            res.send(TripsDetailsArr)
                                                        }




                                                    }).catch(errHandler)



                                                }).catch(errHandler)


                                            }



                                        ).catch(errHandler)




                                    }


                                }).catch(errHandler)
                            }
                        })
                    } else {
                        console.log("here5")
                        Driver.findAll({
                            where: {
                                driverid: decoded.id,
                                status: "done"
                            }
                        }).then(DriverRides => {
                            console.log("here6")

                            if (DriverRides.length > 0) {
                                console.log("here7")
                                DriverRides.forEach(DriverRide => {
                                    if (DriverRide) {
                                        Trips.findOne({
                                            where: {
                                                id: DriverRide.tripid

                                            }
                                        }).then(trip => {
                                            console.log("bye1")


                                            OfferRideTo.findOne({
                                                where: {
                                                    id: DriverRide.offerid

                                                }
                                            }).then(OfferRideFromDetails => {
                                                console.log("bye2")
                                                Car.findOne({
                                                    where: {
                                                        id: OfferRideFromDetails.carid

                                                    }
                                                }).then(carDetails => {
                                                    TripsDetailsArr[count] = ({
                                                        type: "driver",
                                                        "carDetails.model": carDetails.model,
                                                        "carDetails.brand": carDetails.brand,
                                                        "date": trip.date,
                                                        "actualpickuptime": DriverRide.actualpickuptime,
                                                        "actualarrivaltime": DriverRide.actualarrivaltime,
                                                        "fare": DriverRide.fare,
                                                        "total time": DriverRide.time,
                                                        "startloclatitude": trip.startloclatitude,
                                                        "startloclongitude": trip.startloclongitude,
                                                        "endloclatitude": trip.endloclatitude,
                                                        "endloclongitude": trip.endloclongitude,
                                                        "starttime": trip.starttime
                                                    })
                                                    count++;
                                                    if (count === DriverRides.length) {
                                                        console.log("COUNT", count)
                                                        res.send(TripsDetailsArr)


                                                    }

                                                }).catch(errHandler)

                                            })



                                        }).catch(errHandler)


                                    }
                                })
                            } else {
                                console.log("here8")
                                res.send({ message: "No Trips for this user" })
                                res.end()
                            }
                        })

                    }

                })

            } else {
                res.status(404).send({ message: "User not found" })
                res.end()
            }
        }

    ).catch(err => {
        console.log('error :' + err)
    })
})

module.exports = router