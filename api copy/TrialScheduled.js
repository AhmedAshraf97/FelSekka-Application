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
const jwt = require('jsonwebtoken');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
//to from,number of rider,car details,location of rider to from,gender,all details
//

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {

    var jsonStr = '{"ScheduledTrips":[]}';
    var obj = JSON.parse(jsonStr);

    var RiderTrip = {}
    var ValidChecks = true;
    var c = 0;
    var count = 0
    var decoded;
    var countcheck = 0;
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

    if (ValidChecks) {
        const user = await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        }).catch(err => {
            console.log('error :' + err)
        })
        var RiderRidesTripIDTo = []
        var RiderRidesRequestIDTo = []
        var RiderRidesOfferIDTo = []

        var RiderRidesTripIDFrom = []
        var RiderRidesRequestIDFrom = []
        var RiderRidesOfferIDFrom = []
        var TripsTo = []
        var TripsFrom = []
        if (user) {
            const RiderRides = await Rider.findAll({
                where: {
                    riderid: decoded.id,
                    status: "scheduled"
                }
            }).catch(errHandler)


            if (RiderRides.length > 0) {
                for (RiderRide of RiderRides) {
                    if (RiderRide.tofrom === "to") {
                        RiderRidesTripIDTo.push(RiderRides.tripid)
                        RiderRidesRequestIDTo.push(RiderRide.requestid)
                        RiderRidesOfferIDTo.push(RiderRide.offerid)

                    } else {
                        RiderRidesTripIDFrom.push(RiderRides.tripid)
                        RiderRidesRequestIDFrom.push(RiderRide.requestid)
                        RiderRidesOfferIDFrom.push(RiderRide.offerid)


                    }

                }
                var RiderRidesTripID = RiderRidesTripIDTo.concat(RiderRidesTripIDFrom)
                const trips = await Trips.findAll({
                    where: {
                        id: {
                            [Op.in]: RiderRidesTripID
                        },
                        status: "scheduled"

                    }


                }).catch(errHandler)
                var TripToID = []
                var TripFromID = []
                for (trip of trips) {
                    if (trip.tofrom == "to") {
                        TripsTo.push(trip)
                        TripToID.push(trip.id)

                    } else {
                        TripsFrom.push(trip)
                        TripFromID.push(trip.id)

                    }
                }
                ///////////////TO TRIP Rider
                var RequestRideTo = []
                const RequestRideToDetails = await RequestRideTo.findAll({
                        where: {
                            id: {
                                [Op.in]: RiderRidesRequestIDTo
                            }


                        }
                    }).catch(errHandler)
                    ///////////////////////////
                for (RequestRideToDetail of RequestRideToDetails) {
                    RequestRideTo.push(RequestRideToDetail)
                } ////////////////msh lazem

                const OfferRideToDetails = await OfferRideTo.findAll({
                    where: {
                        id: {
                            [Op.in]: RiderRidesOfferIDTo
                        }


                    }
                }).catch(errHandler)
                var offerRideCar = []
                var offerRideUser = []
                for (OfferRideToDetail of OfferRideToDetails) {
                    offerRideCar.push(OfferRideToDetail.carid)
                    offerRideUser.push(OfferRideToDetail.userid)
                }

                const carDetails = await Car.findAll({
                    where: {
                        id: offerRideCar
                    }
                }).catch(errHandler)


                const DriverOftrip = await User.findOne({
                    where: {
                        id: {
                            [Op.in]: offerRideUser
                        }
                    }
                }).catch(errHandler)
                var RidersTrip = []

                const AllRidersTrip = await Rider.findAll({
                        where: {
                            tripid: {
                                [Op.in]: TripToID
                            },
                            status: "scheduled"
                        }

                    }).catch(errHandler)
                    // var 
                    // r.push()
                    // //awl wahda fy array
                    // for(r of AllRidersTrip){
                    //     if()
                    //     {

                //     }
                // }

                const AllRidersTripDetails = await User.findOne({
                    where: {
                        id: AllRidersTripEach.riderid
                    }

                }).catch(errHandler)




                for (RiderRide of RiderRides) {
                    const trip = await Trips.findOne({
                        where: {
                            id: RiderRide.tripid,
                            status: "scheduled"

                        }
                    }).catch(errHandler)

                    if (trip) {
                        countcheck++;


                        if (RiderRide.tofrom === "to") {
                            const RequestRideToDetails = await RequestRideTo.findOne({
                                where: {
                                    id: RiderRide.requestid

                                }
                            }).catch(errHandler)
                            const OfferRideToDetails = await OfferRideTo.findOne({
                                where: {
                                    id: RiderRide.offerid

                                }
                            }).catch(errHandler)

                            const carDetails = await Car.findOne({
                                where: {
                                    id: OfferRideToDetails.carid
                                }
                            }).catch(errHandler)


                            const DriverOftrip = await User.findOne({
                                where: {
                                    id: OfferRideToDetails.userid
                                }
                            }).catch(errHandler)
                            const AllRidersTrip = await Rider.findAll({
                                where: {
                                    tripid: trip.id,
                                    status: "scheduled"
                                }

                            }).catch(errHandler)
                            if (AllRidersTrip.length > 0) {
                                for (AllRidersTrip of AllRidersTripEach) {

                                    const AllRidersTripDetails = await User.findOne({
                                        where: {
                                            id: AllRidersTripEach.riderid
                                        }

                                    }).catch(errHandler)

                                    if (AllRidersTripDetails) {
                                        if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                            RiderTrip[c] = ({
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "latitude": AllRidersTripDetails.latitude,
                                                "longitude": AllRidersTripDetails.longitude
                                            })
                                            c++;
                                        }
                                    }

                                    if (c === AllRidersTrip.length - 1) {
                                        obj['ScheduledTrips'].push({
                                            type: "Rider",
                                            "tripid": trip.id,
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
                                        c = 0;
                                        RiderTrip = {}


                                        if (count === RiderRides.length) {
                                            res.send(obj)
                                        }


                                    }








                                }

                            }

                        } else {
                            //from

                            const RequestRideFromDetails = await RequestRideFrom.findOne({
                                where: {
                                    id: RiderRide.requestid

                                }
                            }).catch(errHandler)


                            const OfferRideFromDetails = await OfferRideFrom.findOne({
                                where: {
                                    id: RiderRide.offerid

                                }
                            }).catch(errHandler)

                            const carDetails = await Car.findOne({
                                where: {
                                    id: OfferRideFromDetails.carid

                                }
                            }).catch(errHandler)
                            const DriverOftrip = await User.findOne({
                                where: {
                                    id: OfferRideFromDetails.userid
                                }
                            }).catch(errHandler)
                            const AllRidersTrip = await Rider.findAll({
                                where: {
                                    tripid: trip.id,
                                    status: "scheduled"
                                }

                            }).catch(errHandler)

                            if (AllRidersTrip.length > 0) {
                                for (AllRidersTripEach of AllRidersTrip) {

                                    const AllRidersTripDetails = await User.findOne({
                                        where: {
                                            id: AllRidersTripEach.riderid
                                        }

                                    }).catch(errHandler)
                                    if (AllRidersTripDetails) {

                                        if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                            RiderTrip[c] = ({
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "latitude": AllRidersTripDetails.latitude,
                                                "longitude": AllRidersTripDetails.longitude

                                            })
                                            c++;
                                        }

                                    }

                                    if (c === AllRidersTrip.length - 1) {
                                        obj['ScheduledTrips'].push({
                                            type: "Rider",
                                            "tripid": trip.id,
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
                                        c = 0;
                                        RiderTrip = {}


                                        if (count === RiderRides.length) {
                                            res.send(obj)
                                        }


                                    }

                                }

                            }

                        }

                    } else if (countcheck == RiderRides.length) {
                        res.status(409).send({ error: "No Trips found", message: "No Trips found" })
                        res.end()

                    }
                }
            }

            var DriverRides = Driver.findAll({
                where: {
                    driverid: decoded.id,
                    status: "scheduled"
                }
            }).catch(errHandler)



            if (DriverRides.length > 0) {

                for (DriverRide of DriverRides) {

                    if (DriverRide) {
                        countcheck++;
                        const trip = await Trips.findOne({
                            where: {
                                id: DriverRide.tripid,
                                status: "scheduled"

                            }
                        }).catch(errHandler)

                        if (trip) {

                            if (DriverRide.tofrom === "to") {
                                const OfferRideToDetails = await OfferRideTo.findOne({
                                    where: {
                                        id: DriverRide.offerid

                                    }
                                }).catch(errHandler)
                                const carDetails = await Car.findOne({
                                    where: {
                                        id: OfferRideToDetails.carid

                                    }
                                }).catch(errHandler)
                                const AllRidersTrip = await Rider.findAll({
                                    where: {
                                        offerid: DriverRide.offerid,
                                        status: "scheduled"
                                    }

                                }).catch(errHandler)
                                if (AllRidersTrip.length > 0) {
                                    c = 0
                                    for (AllRidersTripEach of AllRidersTrip) {

                                        const AllRidersTripDetails = await User.findOne({
                                            where: {
                                                id: AllRidersTripEach.riderid
                                            }

                                        }).catch(errHandler)

                                        if (AllRidersTripDetails) {

                                            RiderTrip[c] = ({
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "latitude": AllRidersTripDetails.latitude,
                                                "longitude": AllRidersTripDetails.longitude

                                            })
                                            c++;



                                        }


                                        if (c === AllRidersTrip.length) {

                                            obj['ScheduledTrips'].push({
                                                type: "driver",
                                                "tripid": trip.id,
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

                                            c = 0;
                                            RiderTrip = {}
                                            count++;
                                            if (count === DriverRides.length) {
                                                res.send(obj)
                                            }


                                        }




                                    }

                                }


                            } else {
                                const OfferRideFromDetails = await OfferRideFrom.findOne({
                                    where: {
                                        id: DriverRide.offerid

                                    }
                                }).catch(errHandler)


                                const carDetails = await Car.findOne({
                                    where: {
                                        id: OfferRideFromDetails.carid

                                    }
                                }).catch(errHandler)
                                const AllRidersTrip = await Rider.findAll({
                                    where: {
                                        offerid: DriverRide.offerid,
                                        status: "scheduled"
                                    }

                                }).catch(errHandler)

                                if (AllRidersTrip.length > 0) {
                                    for (AllRidersTrip of AllRidersTripEach) {

                                        const AllRidersTripDetails = await User.findOne({
                                            where: {
                                                id: AllRidersTripEach.riderid
                                            }

                                        }).catch(errHandler)

                                        if (AllRidersTripDetails) {

                                            RiderTrip[c] = ({
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "latitude": AllRidersTripDetails.latitude,
                                                "longitude": AllRidersTripDetails.longitude

                                            })
                                            c++;


                                        }

                                        if (c === AllRidersTrip.length) {


                                            obj['ScheduledTrips'].push({
                                                type: "driver",
                                                "tripid": trip.id,
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

                                            c = 0;
                                            RiderTrip = {}
                                            count++;


                                            if (count === DriverRides.length) {
                                                res.send(obj)
                                            }


                                        }









                                    }

                                }










                            }
                        } else if (countcheck == DriverRides.length) {
                            res.status(409).send({ error: "No Trips found", message: "No Trips found" })
                            res.end()

                        }




                    }
                }
            } else {

                res.status(409).send({ error: "No Trips found", message: "No Trips found" })
                res.end()
            }





        } else {
            res.status(404).send({ error: "User not found", message: "User not found" })
            res.end()
        }

    }
})

module.exports = router