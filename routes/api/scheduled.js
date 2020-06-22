const User = require('../../models/users');
const Trips = require('../../models/trips')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');

const RequestRideFrom = require('../../models/requestridefrom');
const RequestRideTo = require('../../models/requestrideto');
const Organization = require('../../models/organizations');
const OfferRideFrom = require('../../models/offerridefrom');
const OfferRideTo = require('../../models/offerrideto');
const Car = require('../../models/cars');
const ExpiredToken = require('../../models/expiredtokens');


const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {

    var jsonStr = '{"ScheduledTrips":[]}';
    var jsonStr1 = '{"RiderTrip":[]}';
    var obj = JSON.parse(jsonStr);
    var objRider = JSON.parse(jsonStr1);

    //var RiderTrip = {}
    var ValidChecks = true;
    var c = 0;
    var count = 0
    var decoded;

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

        var countobj = 0;
        if (user) {
            const RiderRides = await Rider.findAll({
                where: {
                    riderid: decoded.id,
                    status: {
                        [Op.or]: ["scheduled", "ongoing"]
                    }
                }
            }).catch(errHandler)


            if (RiderRides.length > 0) {

                for (RiderRide of RiderRides) {
                    const trip = await Trips.findOne({
                        where: {
                            id: RiderRide.tripid,
                            status: {
                                [Op.or]: ["scheduled", "ongoing"]
                            }

                        }
                    }).catch(errHandler)

                    if (trip) {



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
                                    status: {
                                        [Op.or]: ["scheduled", "ongoing"]
                                    },


                                },
                                order: [
                                    ['pickuptime', 'ASC']
                                ]

                            }).catch(errHandler)

                            if (AllRidersTrip.length > 0) {
                                jsonStr1 = '{"RiderTrip":[]}';
                                var DriverDB = await Driver.findOne({
                                    where: {
                                        driverid: OfferRideToDetails.userid,
                                        tripid: trip.id,
                                        status: {
                                            [Op.or]: ["scheduled", "ongoing"]
                                        }
                                    }
                                }).catch(errHandler)

                                objRider = JSON.parse(jsonStr1);
                                const orgDetails = await Organization.findOne({
                                    where: {

                                        id: OfferRideToDetails.toorgid


                                    }
                                }).catch(errHandler)
                                for (AllRidersTripEach of AllRidersTrip) {

                                    const AllRidersTripDetails = await User.findOne({
                                        where: {
                                            id: AllRidersTripEach.riderid

                                        }

                                    }).catch(errHandler)


                                    const RiderRequestRideToDetails = await RequestRideTo.findOne({
                                        where: {
                                            id: AllRidersTripEach.requestid

                                        }
                                    }).catch(errHandler)


                                    if (AllRidersTripDetails) {
                                        if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                            objRider['RiderTrip'].push({
                                                "id": AllRidersTripDetails.id,
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "rating": AllRidersTripDetails.rating,
                                                "gender": AllRidersTripDetails.gender,
                                                "latitude": RiderRequestRideToDetails.fromlatitude,
                                                "longitude": RiderRequestRideToDetails.fromlongitude,
                                                "time": AllRidersTripEach.pickuptime
                                            })

                                        }
                                    }



                                }
                                obj['ScheduledTrips'].push({
                                    tofrom: "to",
                                    type: "Rider",
                                    "tripid": trip.id,
                                    "carModel": carDetails.model,
                                    "carBrand": carDetails.brand,
                                    "carYear": carDetails.year,
                                    "carType": carDetails.type,
                                    "carColor": carDetails.color,
                                    "carPlateletters": carDetails.plateletters,
                                    "carPlatenumbers": carDetails.platenumbers,
                                    "homelongitude": RequestRideToDetails.fromlongitude,
                                    "homelatitude": RequestRideToDetails.fromlatitude,
                                    "orgname": orgDetails.name,
                                    "orglatitude": orgDetails.latitude,
                                    "orglongitude": orgDetails.longitude,
                                    "pickuptime": RiderRide.pickuptime,
                                    "arrivaltime": RiderRide.arrivaltime,
                                    "date": trip.date,
                                    "fare": RiderRide.expectedfare,
                                    "numberRiders": trip.numberofseats,
                                    "ridewith": RequestRideToDetails.ridewith,
                                    "smoking": RequestRideToDetails.smoking,
                                    "Driver": ({
                                        "driverid": DriverOftrip.id,
                                        "Driverusername": DriverOftrip.username,
                                        "Driverfirstname": DriverOftrip.firstname,
                                        "Driverid": DriverOftrip.id,
                                        "Driverlastname": DriverOftrip.lastname,
                                        "Driverphonenumber": DriverOftrip.phonenumber,
                                        "Driverphoto": DriverOftrip.photo,
                                        "DriverGender": DriverOftrip.gender,
                                        "DriverRating": DriverOftrip.rating,
                                        "time": DriverDB.pickuptime,
                                        "longitude": OfferRideToDetails.fromlongitude,
                                        "latitude": OfferRideToDetails.fromlatitude
                                    }),

                                    "Riders in the trip": objRider

                                })
                                countobj++;

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
                                    status: {
                                        [Op.or]: ["scheduled", "ongoing"]
                                    }
                                },

                                order: [

                                    ['arrivaltime', 'ASC']
                                ]

                            }).catch(errHandler)

                            if (AllRidersTrip.length > 0) {
                                jsonStr1 = '{"RiderTrip":[]}';

                                objRider = JSON.parse(jsonStr1);
                                const orgDetails = await Organization.findOne({
                                    where: {

                                        id: OfferRideFromDetails.fromorgid


                                    }
                                }).catch(errHandler)
                                var DriverDB = await Driver.findOne({
                                    where: {
                                        driverid: OfferRideFromDetails.userid,
                                        tripid: trip.id,
                                        status: {
                                            [Op.or]: ["scheduled", "ongoing"]
                                        }
                                    }
                                }).catch(errHandler)

                                for (AllRidersTripEach of AllRidersTrip) {

                                    const AllRidersTripDetails = await User.findOne({
                                        where: {
                                            id: AllRidersTripEach.riderid
                                        }

                                    }).catch(errHandler)


                                    const RiderRequestRideFromDetails = await RequestRideFrom.findOne({
                                        where: {
                                            id: AllRidersTripEach.requestid

                                        }
                                    }).catch(errHandler)
                                    if (AllRidersTripDetails) {

                                        if (AllRidersTripDetails.id !== RiderRide.riderid) {
                                            objRider['RiderTrip'].push({
                                                "id": AllRidersTripDetails.id,
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "rating": AllRidersTripDetails.rating,
                                                "gender": AllRidersTripDetails.gender,
                                                "latitude": RiderRequestRideFromDetails.tolatitude,
                                                "longitude": RiderRequestRideFromDetails.tolongitude,
                                                "time": AllRidersTripEach.arrivaltime

                                            })

                                        }

                                    }



                                }
                                obj['ScheduledTrips'].push({
                                    "tofrom": "from",
                                    type: "Rider",
                                    "tripid": trip.id,
                                    "carModel": carDetails.model,
                                    "carBrand": carDetails.brand,
                                    "carYear": carDetails.year,
                                    "carType": carDetails.type,
                                    "carColor": carDetails.color,
                                    "carPlateletters": carDetails.plateletters,
                                    "carPlatenumbers": carDetails.platenumbers,
                                    "homelongitude": RequestRideFromDetails.tolongitude,
                                    "homelatitude": RequestRideFromDetails.tolatitude,
                                    "orgname": orgDetails.name,
                                    "orglatitude": orgDetails.latitude,
                                    "orglongitude": orgDetails.longitude,
                                    "pickuptime": RiderRide.pickuptime,
                                    "arrivaltime": RiderRide.arrivaltime,
                                    "date": trip.date,
                                    "fare": RiderRide.expectedfare,
                                    "numberRiders": trip.numberofseats,
                                    "ridewith": RequestRideFromDetails.ridewith,
                                    "smoking": RequestRideFromDetails.smoking,
                                    "Driver": ({
                                        "driverid": DriverOftrip.id,
                                        "Driverusername": DriverOftrip.username,
                                        "Driverfirstname": DriverOftrip.firstname,
                                        "Driverid": DriverOftrip.id,
                                        "Driverlastname": DriverOftrip.lastname,
                                        "Driverphonenumber": DriverOftrip.phonenumber,
                                        "Driverphoto": DriverOftrip.photo,
                                        "DriverGender": DriverOftrip.gender,
                                        "DriverRating": DriverOftrip.rating,
                                        "time": DriverDB.pickuptime,
                                        "longitude": OfferRideFromDetails.tolongitude,
                                        "latitude": OfferRideFromDetails.tolatitude
                                    }),

                                    "Riders in the trip": objRider

                                })
                                countobj++;

                            }

                        }

                    }
                }
            }

            var DriverRides = await Driver.findAll({
                where: {
                    driverid: decoded.id,
                    status: {
                        [Op.or]: ["scheduled", "ongoing"]
                    }
                }
            }).catch(errHandler)



            if (DriverRides.length > 0) {

                for (DriverRide of DriverRides) {

                    if (DriverRide) {

                        const trip = await Trips.findOne({
                            where: {
                                id: DriverRide.tripid,
                                status: {
                                    [Op.or]: ["scheduled", "ongoing"]
                                }

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
                                        tripid: trip.id,
                                        offerid: DriverRide.offerid,
                                        status: {
                                            [Op.or]: ["scheduled", "ongoing"]
                                        },
                                        tofrom: "to"
                                    },
                                    order: [
                                        ['pickuptime', 'ASC']
                                    ]

                                }).catch(errHandler)
                                if (AllRidersTrip.length > 0) {

                                    jsonStr1 = '{"RiderTrip":[]}';

                                    objRider = JSON.parse(jsonStr1);
                                    const orgDetails = await Organization.findOne({
                                        where: {

                                            id: OfferRideToDetails.toorgid


                                        }
                                    }).catch(errHandler)
                                    for (AllRidersTripEach of AllRidersTrip) {

                                        const AllRidersTripDetails = await User.findOne({
                                            where: {
                                                id: AllRidersTripEach.riderid
                                            }

                                        }).catch(errHandler)
                                        const RiderRequestRideToDetails = await RequestRideTo.findOne({
                                            where: {
                                                id: AllRidersTripEach.requestid


                                            }
                                        }).catch(errHandler)

                                        if (AllRidersTripDetails) {

                                            objRider['RiderTrip'].push({
                                                "id": AllRidersTripDetails.id,
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "rating": AllRidersTripDetails.rating,
                                                "gender": AllRidersTripDetails.gender,
                                                "latitude": RiderRequestRideToDetails.fromlatitude,
                                                "longitude": RiderRequestRideToDetails.fromlongitude,
                                                "fare": AllRidersTripEach.expectedfare,
                                                "time": AllRidersTripEach.pickuptime

                                            })




                                        }


                                    }
                                    obj['ScheduledTrips'].push({
                                        "tofrom": "to",
                                        type: "driver",
                                        "tripid": trip.id,
                                        "carModel": carDetails.model,
                                        "carBrand": carDetails.brand,
                                        "carYear": carDetails.year,
                                        "carType": carDetails.type,
                                        "carColor": carDetails.color,
                                        "carPlateletters": carDetails.plateletters,
                                        "carPlatenumbers": carDetails.platenumbers,
                                        "homelongitude": OfferRideToDetails.fromlongitude,
                                        "homelatitude": OfferRideToDetails.fromlatitude,
                                        "orgname": orgDetails.name,
                                        "orglatitude": orgDetails.latitude,
                                        "orglongitude": orgDetails.longitude,
                                        "pickuptime": DriverRide.pickuptime,
                                        "arrivaltime": DriverRide.arrivaltime,
                                        "date": trip.date,
                                        "fare": DriverRide.expectedfare,
                                        "numberRiders": trip.numberofseats,
                                        "ridewith": OfferRideToDetails.ridewith,
                                        "smoking": OfferRideToDetails.smoking,
                                        "Riders in the trip": objRider

                                    })
                                    countobj++;

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
                                        tripid: trip.id,
                                        offerid: DriverRide.offerid,
                                        status: {
                                            [Op.or]: ["scheduled", "ongoing"]
                                        }
                                    },
                                    order: [
                                        ['arrivaltime', 'ASC']
                                    ]

                                }).catch(errHandler)

                                if (AllRidersTrip.length > 0) {
                                    jsonStr1 = '{"RiderTrip":[]}';

                                    objRider = JSON.parse(jsonStr1);
                                    const orgDetails = await Organization.findOne({
                                        where: {

                                            id: OfferRideFromDetails.fromorgid


                                        }
                                    }).catch(errHandler)
                                    for (AllRidersTripEach of AllRidersTrip) {

                                        const AllRidersTripDetails = await User.findOne({
                                            where: {
                                                id: AllRidersTripEach.riderid
                                            }

                                        }).catch(errHandler)
                                        const RiderRequestRideFromDetails = await RequestRideFrom.findOne({
                                            where: {
                                                id: AllRidersTripEach.requestid

                                            }
                                        }).catch(errHandler)

                                        if (AllRidersTripDetails) {

                                            objRider['RiderTrip'].push({
                                                "id": AllRidersTripDetails.id,
                                                "username": AllRidersTripDetails.username,
                                                "firstname": AllRidersTripDetails.firstname,
                                                "lastname": AllRidersTripDetails.lastname,
                                                "phonenumber": AllRidersTripDetails.phonenumber,
                                                "photo": AllRidersTripDetails.photo,
                                                "rating": AllRidersTripDetails.rating,
                                                "gender": AllRidersTripDetails.gender,
                                                "latitude": RiderRequestRideFromDetails.tolatitude,
                                                "longitude": RiderRequestRideFromDetails.tolongitude,
                                                "fare": AllRidersTripEach.expectedfare,
                                                "time": AllRidersTripEach.arrivaltime

                                            })
                                            c++;


                                        }




                                    }
                                    obj['ScheduledTrips'].push({

                                        "tofrom": "from",
                                        type: "driver",
                                        "tripid": trip.id,
                                        "carModel": carDetails.model,
                                        "carBrand": carDetails.brand,
                                        "carYear": carDetails.year,
                                        "carType": carDetails.type,
                                        "carColor": carDetails.color,
                                        "carPlateletters": carDetails.plateletters,
                                        "carPlatenumbers": carDetails.platenumbers,
                                        "homelongitude": OfferRideFromDetails.tolongitude,
                                        "homelatitude": OfferRideFromDetails.tolatitude,
                                        "orgname": orgDetails.name,
                                        "orglatitude": orgDetails.latitude,
                                        "orglongitude": orgDetails.longitude,
                                        "pickuptime": DriverRide.pickuptime,
                                        "arrivaltime": DriverRide.arrivaltime,
                                        "date": trip.date,
                                        "fare": DriverRide.expectedfare,
                                        "numberRiders": trip.numberofseats,
                                        "ridewith": OfferRideFromDetails.ridewith,
                                        "smoking": OfferRideFromDetails.smoking,
                                        "Riders in the trip": objRider




                                    })
                                    countobj++;

                                }



                            }
                        }




                    }
                }
            }
            if (countobj !== 0) {
                res.status(200).send(obj)
                res.end()
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