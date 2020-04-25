//status:sch,pick ,arr
//no actual,time,distance,

const User = require('../../models/users');
const Trips = require('../../models/trips')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');

const RequestRideFrom = require('../../models/requestridefrom');
const RequestRideTo = require('../../models/requestrideto');

const OfferRideFrom = require('../../models/offerridefrom');
const OfferRideTo = require('../../models/offerrideto');
const Car = require('../../models/cars');
const ExpiredToken = require('../../models/expiredtokens');


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
    var RiderTrip = {}
    var ValidChecks = true;
    var c = 0;
    var count = 0
    var decoded;
    var countcheck = 0;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to view user past trips" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to delete any car" })
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
                Rider.findAll({
                    where: {
                        riderid: decoded.id,
                        status: "scheduled"
                    }
                }).then(RiderRides => {


                    if (RiderRides.length > 0) {

                        RiderRides.forEach(RiderRide => {

                            if (RiderRide) {

                                Trips.findOne({
                                    where: {
                                        id: RiderRide.tripid,
                                        status: "scheduled"

                                    }
                                }).then(trip => {
                                    if (trip) {
                                        countcheck++;


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

                                                            User.findOne({
                                                                where: {
                                                                    id: OfferRideToDetails.userid
                                                                }
                                                            }).then(DriverOftrip => {

                                                                Rider.findAll({
                                                                    where: {
                                                                        tripid: trip.id,
                                                                        status: "scheduled"
                                                                    }

                                                                }).then(AllRidersTrip => {
                                                                    if (AllRidersTrip.length > 0) {
                                                                        AllRidersTrip.forEach(AllRidersTripEach => {

                                                                            User.findOne({
                                                                                where: {
                                                                                    id: AllRidersTripEach.riderid
                                                                                }

                                                                            }).then(AllRidersTripDetails => {
                                                                                if (AllRidersTripDetails) {
                                                                                    if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                                                                        RiderTrip[c] = ({
                                                                                            "username": AllRidersTripDetails.username,
                                                                                            "firstname": AllRidersTripDetails.firstname,
                                                                                            "lastname": AllRidersTripDetails.lastname,
                                                                                            "phonenumber": AllRidersTripDetails.phonenumber,
                                                                                            "photo": AllRidersTripDetails.photo

                                                                                        })
                                                                                        c++;
                                                                                    }
                                                                                }

                                                                                if (c === AllRidersTrip.length - 1) {
                                                                                    TripsDetailsArr[count] = ({
                                                                                        type: "Rider",
                                                                                        "carDetails.model": carDetails.model,
                                                                                        "carDetails.brand": carDetails.brand,
                                                                                        "pickuplongitude": RequestRideToDetails.fromlongitude,
                                                                                        "pickuplatitude": RequestRideToDetails.fromlatitude,
                                                                                        "arrivalloclatitude": trip.endloclatitude,
                                                                                        "arrivalloclongitude": trip.endloclongitude,
                                                                                        "pickuptime": RiderRide.pickuptime,
                                                                                        "arrivaltime": RiderRide.arrivaltime,
                                                                                        "date": trip.date,
                                                                                        "fare": RiderRide.fare,
                                                                                        "Driverusername": DriverOftrip.username,
                                                                                        "Driverfirstname": DriverOftrip.firstname,
                                                                                        "Driverlastname": DriverOftrip.lastname,
                                                                                        "Driverphonenumber": DriverOftrip.phonenumber,
                                                                                        "Driverphoto": DriverOftrip.photo,
                                                                                        "Riders in the trip": RiderTrip

                                                                                    })
                                                                                    count++;

                                                                                    if (count === RiderRides.length) {
                                                                                        res.send(TripsDetailsArr)
                                                                                    }


                                                                                }




                                                                            }).catch(errHandler)




                                                                        })

                                                                    }



                                                                })


                                                            }).catch(errHandler)








                                                        }).catch(errHandler)



                                                    }).catch(errHandler)


                                                }



                                            ).catch(errHandler)


                                        } else {
                                            //from

                                            RequestRideFrom.findOne({
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
                                                            User.findOne({
                                                                where: {
                                                                    id: OfferRideFromDetails.userid
                                                                }
                                                            }).then(DriverOftrip => {
                                                                ///
                                                                Rider.findAll({
                                                                    where: {
                                                                        tripid: trip.id,
                                                                        status: "scheduled"
                                                                    }

                                                                }).then(AllRidersTrip => {
                                                                    if (AllRidersTrip.length > 0) {
                                                                        AllRidersTrip.forEach(AllRidersTripEach => {

                                                                            User.findOne({
                                                                                where: {
                                                                                    id: AllRidersTripEach.riderid
                                                                                }

                                                                            }).then(AllRidersTripDetails => {

                                                                                if (AllRidersTripDetails) {
                                                                                    if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                                                                        RiderTrip[c] = ({
                                                                                            "username": AllRidersTripDetails.username,
                                                                                            "firstname": AllRidersTripDetails.firstname,
                                                                                            "lastname": AllRidersTripDetails.lastname,
                                                                                            "phonenumber": AllRidersTripDetails.phonenumber,
                                                                                            "photo": AllRidersTripDetails.photo

                                                                                        })
                                                                                        c++;
                                                                                    }

                                                                                }

                                                                                if (c === AllRidersTrip.length - 1) {
                                                                                    TripsDetailsArr[count] = ({
                                                                                        type: "Rider",
                                                                                        "carDetails.model": carDetails.model,
                                                                                        "carDetails.brand": carDetails.brand,
                                                                                        "arrivallongitude": RequestRideFromDetails.tolongitude,
                                                                                        "arrivallatitude": RequestRideFromDetails.tolatitude,
                                                                                        "pickuploclatitude": trip.endloclatitude,
                                                                                        "pickuploclongitude": trip.endloclongitude,
                                                                                        "date": trip.date,
                                                                                        "pickuptime": RiderRide.pickuptime,
                                                                                        "arrivaltime": RiderRide.aarrivaltime,
                                                                                        "fare": RiderRide.fare,
                                                                                        "Driverusername": DriverOftrip.username,
                                                                                        "Driverfirstname": DriverOftrip.firstname,
                                                                                        "Driverlastname": DriverOftrip.lastname,
                                                                                        "Driverphonenumber": DriverOftrip.phonenumber,
                                                                                        "Driverphoto": DriverOftrip.photo,
                                                                                        "Riders in the trip": RiderTrip

                                                                                    })
                                                                                    count++;

                                                                                    if (count === RiderRides.length) {

                                                                                        res.send(TripsDetailsArr)
                                                                                    }


                                                                                }




                                                                            }).catch(errHandler)




                                                                        })

                                                                    }



                                                                }).catch(errHandler)


                                                            }).catch(errHandler)








                                                        }).catch(errHandler)



                                                    }).catch(errHandler)


                                                }



                                            ).catch(errHandler)




                                        }

                                    } else if (countcheck == RiderRides.length) {
                                        res.send({ message: "No Trips for this user" })
                                        res.end()

                                    }
                                }).catch(errHandler)
                            }
                        })
                    } else {

                        Driver.findAll({
                            where: {
                                driverid: decoded.id,
                                status: "scheduled"
                            }
                        }).then(DriverRides => {


                            if (DriverRides.length > 0) {

                                DriverRides.forEach(DriverRide => {
                                    if (DriverRide) {
                                        countcheck++;
                                        Trips.findOne({
                                            where: {
                                                id: DriverRide.tripid,
                                                status: "scheduled"

                                            }
                                        }).then(trip => {
                                            if (trip) {

                                                if (DriverRide.tofrom === "to") {


                                                    OfferRideTo.findOne({
                                                        where: {
                                                            id: DriverRide.offerid

                                                        }
                                                    }).then(OfferRideToDetails => {

                                                        Car.findOne({
                                                            where: {
                                                                id: OfferRideToDetails.carid

                                                            }
                                                        }).then(carDetails => {
                                                            Rider.findAll({
                                                                where: {
                                                                    offerid: DriverRide.offerid,
                                                                    status: "scheduled"
                                                                }

                                                            }).then(AllRidersTrip => {
                                                                if (AllRidersTrip.length > 0) {
                                                                    AllRidersTrip.forEach(AllRidersTripEach => {

                                                                        User.findOne({
                                                                            where: {
                                                                                id: AllRidersTripEach.riderid
                                                                            }

                                                                        }).then(AllRidersTripDetails => {

                                                                            if (AllRidersTripDetails) {

                                                                                RiderTrip[c] = ({
                                                                                    "username": AllRidersTripDetails.username,
                                                                                    "firstname": AllRidersTripDetails.firstname,
                                                                                    "lastname": AllRidersTripDetails.lastname,
                                                                                    "phonenumber": AllRidersTripDetails.phonenumber,
                                                                                    "photo": AllRidersTripDetails.photo

                                                                                })
                                                                                c++;



                                                                            }


                                                                            if (c === AllRidersTrip.length) {


                                                                                TripsDetailsArr[count] = ({
                                                                                    type: "driver",
                                                                                    "carDetails.model": carDetails.model,
                                                                                    "carDetails.brand": carDetails.brand,
                                                                                    "date": trip.date,
                                                                                    "pickuptime": DriverRide.pickuptime,
                                                                                    "arrivaltime": DriverRide.arrivaltime,
                                                                                    "fare": DriverRide.fare,
                                                                                    "startloclatitude": trip.startloclatitude,
                                                                                    "startloclongitude": trip.startloclongitude,
                                                                                    "endloclatitude": trip.endloclatitude,
                                                                                    "endloclongitude": trip.endloclongitude,
                                                                                    "Riders in the trip": RiderTrip

                                                                                })
                                                                                count++;

                                                                                if (count === DriverRides.length) {

                                                                                    res.send(TripsDetailsArr)
                                                                                }


                                                                            }




                                                                        }).catch(errHandler)




                                                                    })

                                                                }



                                                            }).catch(errHandler)






                                                        }).catch(errHandler)

                                                    }).catch(errHandler)

                                                } else {



                                                    OfferRideFrom.findOne({
                                                        where: {
                                                            id: DriverRide.offerid

                                                        }
                                                    }).then(OfferRideFromDetails => {

                                                        Car.findOne({
                                                            where: {
                                                                id: OfferRideFromDetails.carid

                                                            }
                                                        }).then(carDetails => {
                                                            Rider.findAll({
                                                                where: {
                                                                    offerid: DriverRide.offerid,
                                                                    status: "scheduled"
                                                                }

                                                            }).then(AllRidersTrip => {
                                                                if (AllRidersTrip.length > 0) {
                                                                    AllRidersTrip.forEach(AllRidersTripEach => {

                                                                        User.findOne({
                                                                            where: {
                                                                                id: AllRidersTripEach.riderid
                                                                            }

                                                                        }).then(AllRidersTripDetails => {

                                                                            if (AllRidersTripDetails) {

                                                                                RiderTrip[c] = ({
                                                                                    "username": AllRidersTripDetails.username,
                                                                                    "firstname": AllRidersTripDetails.firstname,
                                                                                    "lastname": AllRidersTripDetails.lastname,
                                                                                    "phonenumber": AllRidersTripDetails.phonenumber,
                                                                                    "photo": AllRidersTripDetails.photo

                                                                                })
                                                                                c++;


                                                                            }

                                                                            if (c === AllRidersTrip.length) {
                                                                                TripsDetailsArr[count] = ({
                                                                                    type: "driver",
                                                                                    "carDetails.model": carDetails.model,
                                                                                    "carDetails.brand": carDetails.brand,
                                                                                    "date": trip.date,
                                                                                    "pickuptime": DriverRide.pickuptime,
                                                                                    "arrivaltime": DriverRide.arrivaltime,
                                                                                    "fare": DriverRide.fare,
                                                                                    "startloclatitude": trip.startloclatitude,
                                                                                    "startloclongitude": trip.startloclongitude,
                                                                                    "endloclatitude": trip.endloclatitude,
                                                                                    "endloclongitude": trip.endloclongitude,
                                                                                    "Riders in the trip": RiderTrip

                                                                                })
                                                                                count++;

                                                                                if (count === DriverRides.length) {

                                                                                    res.send(TripsDetailsArr)
                                                                                }


                                                                            }




                                                                        }).catch(errHandler)




                                                                    })

                                                                }



                                                            }).catch(errHandler)

                                                        }).catch(errHandler)

                                                    }).catch(errHandler)



                                                }
                                            } else if (countcheck == DriverRides.length) {
                                                res.send({ message: "No Trips for this user" })
                                                res.end()

                                            }

                                        }).catch(errHandler)


                                    }
                                })
                            } else {

                                res.send({ message: "No Trips for this user" })
                                res.end()
                            }
                        })

                    }

                }).catch(errHandler)

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