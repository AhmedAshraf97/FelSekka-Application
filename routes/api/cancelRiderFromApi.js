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
const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');

const ReturnTripMatchingFare = require('../../modules/ReturnMatchingFareCalculator');


const CancelRiderFrom = require('../../modules/CancelRiderFrom');

const ExpiredToken = require('../../models/expiredtokens');


class values {
    constructor(from, to, valueDistance, valueDuration) {
        this.from = from;
        this.to = to;
        this.valueDistance = valueDistance;
        this.valueDuration = valueDuration
    }
}


class Rider {
    constructor(ID, DistanceFromOrganization, DepartureTime, TimeFromOrganizationMinutes,
        LatestDropOff, ridewith, smoking, fromorgid, date) {


        this.ID = ID;

        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = [] //todo:block

        this.LatestDropOff = LatestDropOff
            //Timing
        this.DepartureTime = DepartureTime
        this.DropOffTime = this.DepartureTime
        this.ridewith = ridewith
        this.smoking = smoking
        this.fromorgid = fromorgid
        this.date = date
        this.ExpectedFare = 0;

    }
};
class Driver {
    constructor(ID, DistanceFromOrganization, PoolStartTime, TimeFromOrganizationMinutes, capacity,
        LatestDropOff, ridewith, smoking, fromorgid, date, latitude, longitude) {


        this.ID = ID
        this.AssignedRiders = [];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;

        this.LatestDropOff = LatestDropOff
        this.capacity = capacity
        this.MaxDistance = 1.5 * DistanceFromOrganization //removeee


        this.ExpectedFare = 0;
        //Timing
        this.DropOffTime = this.PoolStartTime
        this.PoolStartTime = PoolStartTime
        this.MaxDuration = diff_minutes(this.LatestDropOff, this.PoolStartTime)



        this.ridewith = ridewith;
        this.smoking = smoking
        this.fromorgid = fromorgid
        this.date = date
        this.latitude = latitude
        this.longitude = longitude
    }
};



class distanceDuration {
    constructor(from, to, distance, duration) {
        this.from = from;
        this.to = to;
        this.distance = distance;
        this.duration = duration;
        this.checked = 0;

    }

}
class userArray {
    constructor(ID) {
        this.length = 0;
        this.ID = ID;
        this.checked = 0;
        this.data = [];
    }
    getElementAtIndex(index) {
        return this.data[index];
    }
    push(element) {
        this.data[this.length] = element;
        this.length++;
        return this.length;
    }
    pop() {
        const item = this.data[this.length - 1];
        delete this.data[this.length - 1];
        this.length--;
        return this.data;
    }
    deleteAt(index) {
        for (let i = index; i < this.length - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        delete this.data[this.length - 1];
        this.length--;
        return this.data;
    }
    insertAt(item, index) {
        for (let i = this.length; i >= index; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[index] = item;
        this.length++;
        return this.data;
    }
}


var DriversRiders = new Array();
var RidersRiders = new Array();
var flagExist = 0
var Drivers = []
var Riders = []


function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};


router.post('/', async(req, res) => {
    var DRDistanceDurationValue = []
    var RRDistanceDurationValue = []


    var DeletedRequest;
    var decoded;
    var ValidChecks = true;
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
    const user = await User.findOne({
        where: {
            id: decoded.id,
            status: "existing"
        }
    }).catch(errHandler)
    if (!user) {
        ValidChecks = false;
        res.status(404).send({ message: "User not found" })
        res.end()
    }


    if (ValidChecks) {
        const user = await User.findOne({
            where: {
                id: decoded.id
            }
        }).catch(errHandler)
        const trip = await Trips.findOne({
            where: {
                id: parseInt(req.body.tripid),
                status: "scheduled"
            }
        }).catch(errHandler)
        if (trip) {
            const driverTrip = await DriverDB.findOne({
                where: {
                    tripid: trip.id,
                    status: "scheduled"
                }
            }).catch(errHandler)
            const offer = await Offer.findOne({
                where: {
                    id: driverTrip.offerid
                }
            }).catch(errHandler)

            const RidersTrip = await RiderDB.findAll({
                where: {
                    tripid: trip.id,
                    status: "scheduled"
                },
                order: [
                    [
                        'arrivaltime', 'DESC'
                    ]
                ]
            }).catch(errHandler)
            if (RidersTrip.length === 0) {
                res.status(401).send("No trips found")
                res.end()

            } else if (RidersTrip.length === 1) { // one rider in the trip
                // cancel the whole trip
                if (RidersTrip["0"].riderid === user.id) {
                    await Trips.update({
                        status: "cancelled"
                    }, {
                        where: {
                            id: trip.id

                        }
                    }).catch(errHandler)

                    await DriverDB.update({
                        status: "cancelled"
                    }, {
                        where: {
                            driverid: driverTrip.driverid,
                            tripid: trip.id

                        }
                    }).catch(errHandler)

                    await RiderDB.update({
                        status: "cancelled",
                    }, {
                        where: {
                            riderid: user.id,
                            tripid: trip.id

                        }
                    }).catch(errHandler)

                    await Request.update({
                        status: "cancelled",

                    }, {
                        where: {
                            userid: user.id,
                            id: RidersTrip["0"].requestid
                        }
                    }).catch(errHandler)

                    await Offer.update({
                        status: "cancelled",

                    }, {
                        where: {
                            userid: driverTrip.driverid,
                            id: offer.id

                        }
                    }).catch(errHandler)

                    res.send({ message: "The whole trip is cancelled" })
                    res.end()

                } else {
                    res.status(401).send({ error: "You aren't assigned", message: "You aren't assigned" })
                    res.end()

                }



            } else {
                const orguserDriver = await OrgUser.findOne({
                    where: {
                        orgid: offer.fromorgid,
                        userid: offer.userid,
                        status: "existing"
                    }

                }).catch(errHandler)
                var driver = new Driver(offer.userid, parseFloat(orguserDriver.distancefromorg), new Date(offer.date + " " + offer.departuretime),
                    parseFloat(orguserDriver.timefromorg),
                    offer.numberofseats,
                    new Date(offer.date + " " + offer.latesttime),
                    offer.ridewith,
                    offer.smoking,
                    offer.toorgid,
                    new Date(offer.date),
                    offer.id, parseFloat(offer.tolatitude), parseFloat(offer.tolongitude))
                Drivers.push(driver)


                for (const RiderTrip of RidersTrip) {

                    const request = await Request.findOne({
                        where: {
                            userid: RiderTrip.riderid,
                            status: "scheduled",
                            id: RiderTrip.requestid

                        }
                    }).catch(errHandler)
                    if (RiderTrip.riderid === user.id)
                        DeletedRequest = request.id
                    const orguserRider = await OrgUser.findOne({
                        where: {
                            orgid: request.fromorgid,
                            userid: request.userid,
                            status: "existing"
                        }
                    }).catch(errHandler);
                    if (RiderTrip.riderid !== user.id) {

                        var rider = new Rider(request.userid,
                            parseFloat(orguserRider.distancefromorg),
                            new Date(request.date + " " + request.departuretime),
                            parseFloat(orguserRider.timefromorg),
                            new Date(request.date + " " + request.latesttime),
                            request.ridewith,
                            request.smoking,
                            request.fromorgid,
                            new Date(request.date),
                            request.id)

                        Riders.push(rider);
                        driver.AssignedRiders.push(request.userid)
                    } else {
                        flagExist = 1;
                    }
                }
                if (flagExist === 1) {

                    for (rider in Riders) {
                        const FromRiderToDriver = await BetweenUsers.findOne({
                            where: {
                                user1id: Riders[rider].ID,
                                user2id: driver.ID

                            }

                        }).catch(errHandler)
                        if (FromRiderToDriver) {
                            var valueDistanceDuration = new values(Riders[rider].ID, driver.ID, parseFloat(FromRiderToDriver.distance), Math.round(FromRiderToDriver.time))

                            DRDistanceDurationValue.push(valueDistanceDuration)

                        }
                    }

                    for (riderFrom in Riders) {
                        for (riderTo in Riders) {
                            if (Riders[riderFrom].ID !== Riders[riderTo].ID) {
                                const FromRiderToRider = await BetweenUsers.findOne({
                                    where: {
                                        user1id: Riders[riderFrom].ID,
                                        user2id: Riders[riderTo].ID
                                    }

                                }).catch(errHandler)
                                if (FromRiderToRider) {

                                    var valueDistanceDuration = new values(Riders[riderFrom].ID, Riders[riderTo].ID, parseFloat(FromRiderToRider.distance), Math.round(FromRiderToRider.time))
                                    RRDistanceDurationValue.push(valueDistanceDuration)
                                }



                            }

                        }

                    }


                    var driverID = driver.ID
                    var DriverRow = new userArray(driverID);


                    for (var j = 0; j < DRDistanceDurationValue.length; j++) {
                        if (DRDistanceDurationValue[j].to === driverID) {
                            var distanceDurationObj = new distanceDuration(DRDistanceDurationValue[j].from, DRDistanceDurationValue[j].to, DRDistanceDurationValue[j].valueDistance, DRDistanceDurationValue[j].valueDuration);
                            DriverRow.push(distanceDurationObj);
                        }

                    }

                    if (DriverRow.length > 0) {
                        DriversRiders.push(DriverRow);
                    }
                    for (var i = 0; i < Riders.length; i++) {
                        var riderID = Riders[i].ID
                        var RiderRow = new userArray(riderID);
                        for (var j = 0; j < RRDistanceDurationValue.length; j++) {
                            if (RRDistanceDurationValue[j].to === riderID) {
                                var distanceDurationObj = new distanceDuration(RRDistanceDurationValue[j].from, RRDistanceDurationValue[j].to, RRDistanceDurationValue[j].valueDistance, RRDistanceDurationValue[j].valueDuration);
                                RiderRow.push(distanceDurationObj);
                            }
                        }

                        if (RiderRow.length > 0) {
                            RidersRiders.push(RiderRow);
                        }

                    }
                    var z = await CancelRiderFrom();
                    var p = await ReturnTripMatchingFare('../routes/api/cancelRiderFromApi')

                    await Trips.update({
                        numberofseats: driver.AssignedRiders.length,
                    }, {
                        where: {
                            id: trip.id

                        }
                    }).catch(errHandler)

                    await DriverDB.update({
                        arrivaltime: driver.DropOffTime,
                        expectedfare: driver.ExpectedFare
                    }, {
                        where: {
                            driverid: driver.ID,
                            tripid: trip.id

                        }
                    }).catch(errHandler)

                    await RiderDB.update({
                        status: "cancelled",
                    }, {
                        where: {
                            riderid: user.id,
                            tripid: trip.id

                        }
                    }).catch(errHandler)

                    await Request.update({
                        status: "cancelled"

                    }, {
                        where: {
                            userid: user.id,
                            id: DeletedRequest

                        }
                    }).catch(errHandler)

                    for (var i = 0; i < driver.AssignedRiders.length; i++) {
                        await RiderDB.update({
                            arrivaltime: Riders.find(n => n.ID === driver.AssignedRiders[i]).DropOffTime,
                            expectedfare: Riders.find(n => n.ID === driver.AssignedRiders[i]).ExpectedFare
                        }, {
                            where: {
                                riderid: driver.AssignedRiders[i],
                                tripid: trip.id

                            }
                        }).catch(errHandler)



                    }

                    res.status(200).send({ message: "The trip is cancelled" })
                    res.end()
                } else {
                    res.status(401).send({ error: "you aren't assigned", message: "you aren't assigned" })
                    res.end()
                }
            }

        } else {
            res.status(401).send({ error: "No trip found", message: "No trip found" })
            res.end()
        }


    }

    DriversRiders = []
    RidersRiders = []
    Drivers = []
    Riders = []
})


function getters() {
    return { Riders, Drivers, RidersRiders, DriversRiders }
}




module.exports = { router, getters: getters }