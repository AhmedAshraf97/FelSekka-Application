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


const CancelRiderTo = require('../../CancelRiderTo');

const ExpiredToken = require('../../models/expiredtokens');


class values {
    constructor(from, to, value) {
        this.from = from;
        this.to = to;
        this.value = value;
    }
}

class Rider {
    constructor(ID, DistanceToOrganization, ArrivalTime, TimeToOrganizationMinutes,
        EarliestPickup, ridewith, smoking, toorgid, date) {


        this.ID = ID;

        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = [] //todo:block

        this.EarliestPickup = EarliestPickup
            //Timing
        this.ArrivalTime = ArrivalTime
        this.PickupTime = this.ArrivalTime
        this.ridewith = ridewith
        this.smoking = smoking
        this.toorgid = toorgid
        this.date = date

    }
};
class Driver {
    constructor(ID, DistanceToOrganization, ArrivalTime, TimeToOrganizationMinutes, capacity,
        EarliestStartTime, ridewith, smoking, toorgid, date, latitude, longitude) {

        this.ID = ID
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.EarliestStartTime = EarliestStartTime
        this.capacity = capacity
        this.MaxDistance = 1.5 * DistanceToOrganization //removeee

        //Timing
        this.PoolStartTime = new Date();
        this.ArrivalTime = ArrivalTime
        this.MaxDuration = diff_minutes(this.ArrivalTime, this.EarliestStartTime)


        this.ridewith = ridewith;
        this.smoking = smoking
        this.toorgid = toorgid
        this.date = date
        this.latitude = latitude
        this.longitude = longitude
    }
};


class distance {
    constructor(from, to, distance) {
        this.from = from;
        this.to = to;
        this.distance = distance;
        this.checked = 0;

    }

}
class duration {
    constructor(from, to, duration) {
        this.from = from;
        this.to = to;
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

var DriversRider = new Array();
var RiderRider = new Array();

var DriversRidersDuration = new Array();

var RiderRiderDuration = new Array();

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

    //    console.log(" Fil awal ", JSON.parse(JSON.stringify(Riders)))
    var DRdistanceValue = []
    var DRdurationValue = []
    var RRdistanceValue = []
    var RRdurationValue = []
    var DeletedRequest;
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized to cancel trip" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to cancel trips" })
            res.end();
        }
    }).catch(errHandler)

    if (ValidChecks) {
        const user = await User.findOne({
            where: {
                id: decoded.id
            }
        }).catch(errHandler)
        const trip = await Trips.findOne({
            where: {
                id: req.body.tripid,
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
                        'pickuptime'
                    ]
                ]
            }).catch(errHandler)
            if (RidersTrip.length === 0) {
                res.status(401).send("no trips found")
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

                    res.status(200).send("The trip is cancelled")
                    res.end()

                } else {
                    res.status(401).send("you aren't assigned in this trip")
                    res.end()

                }

            } else {
                const orguserDriver = await OrgUser.findOne({
                    where: {
                        orgid: offer.toorgid,
                        userid: offer.userid,
                        status: "existing"
                    }

                }).catch(errHandler)
                var driver = new Driver(offer.userid, parseFloat(orguserDriver.distancetoorg), new Date(offer.date + " " + offer.arrivaltime),
                    parseFloat(orguserDriver.timetoorg),
                    offer.numberofseats,
                    new Date(offer.date + " " + offer.earliesttime),
                    offer.ridewith,
                    offer.smoking,
                    offer.toorgid,
                    new Date(offer.date),
                    offer.id, parseFloat(offer.fromlatitude), parseFloat(offer.fromlongitude))
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
                            orgid: request.toorgid,
                            userid: request.userid,
                            status: "existing"
                        }
                    }).catch(errHandler);
                    if (RiderTrip.riderid !== user.id) {

                        var rider = new Rider(request.userid,
                            parseFloat(orguserRider.distancetoorg),
                            new Date(request.date + " " + request.arrivaltime),
                            parseFloat(orguserRider.timetoorg),
                            new Date(request.date + " " + request.earliesttime),
                            request.ridewith,
                            request.smoking,
                            request.toorgid,
                            new Date(request.date),
                            request.id)

                        Riders.push(rider);
                        driver.AssignedRiders.push(request.userid)
                    }
                }

                for (rider in Riders) {
                    const FromDriverToRider = await BetweenUsers.findOne({
                        where: {
                            user1id: driver.ID,
                            user2id: Riders[rider].ID
                        }

                    }).catch(errHandler)
                    if (FromDriverToRider) {
                        var valueDuration = new values(driver.ID, Riders[rider].ID, parseFloat(FromDriverToRider.time))
                        var valueDistance = new values(driver.ID, Riders[rider].ID, parseFloat(FromDriverToRider.distance))
                        DRdurationValue.push(valueDuration)
                        DRdistanceValue.push(valueDistance)
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
                                var valueDuration = new values(Riders[riderFrom].ID, Riders[riderTo].ID, parseFloat(FromRiderToRider.time))
                                var valueDistance = new values(Riders[riderFrom].ID, Riders[riderTo].ID, parseFloat(FromRiderToRider.distance))
                                RRdurationValue.push(valueDuration)
                                RRdistanceValue.push(valueDistance)
                            }

                        }

                    }

                }


                var driverID = driver.ID
                var DriverRow = new userArray(driverID);


                for (var j = 0; j < DRdistanceValue.length; j++) {
                    if (DRdistanceValue[j].from === driverID) {
                        var distanceObj = new distance(DRdistanceValue[j].from, DRdistanceValue[j].to, DRdistanceValue[j].value);
                        DriverRow.push(distanceObj);
                    }

                }

                if (DriverRow.length > 0) {
                    DriversRider.push(DriverRow);
                }
                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);
                    for (var j = 0; j < RRdistanceValue.length; j++) {
                        if (RRdistanceValue[j].from === riderID) {
                            var distanceObj = new distance(RRdistanceValue[j].from, RRdistanceValue[j].to, RRdistanceValue[j].value);

                            RiderRow.push(distanceObj);
                        }
                    }

                    if (RiderRow.length > 0) {
                        RiderRider.push(RiderRow);
                    }

                }
                var DriverRowDuration = new userArray(driverID);
                for (var j = 0; j < DRdurationValue.length; j++) {
                    if (DRdurationValue[j].from === driverID) {
                        var durationObj = new duration(DRdurationValue[j].from, DRdurationValue[j].to, DRdurationValue[j].value);
                        DriverRowDuration.push(durationObj);
                    }

                }

                if (DriverRowDuration.length > 0) {

                    DriversRidersDuration.push(DriverRowDuration);
                }

                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRowDuration = new userArray(riderID);

                    for (var j = 0; j < RRdurationValue.length; j++) {
                        if (RRdurationValue[j].from === riderID) {
                            var durationObj = new duration(RRdurationValue[j].from, RRdurationValue[j].to, RRdurationValue[j].value);
                            RiderRowDuration.push(durationObj);
                        }
                    }

                    if (RiderRowDuration.length > 0) {

                        RiderRiderDuration.push(RiderRowDuration);
                    }


                }

                var z = await CancelRiderTo();
                await Trips.update({
                    numberofseats: driver.AssignedRiders.length - 1,
                }, {
                    where: {
                        id: trip.id

                    }
                }).catch(errHandler)

                await DriverDB.update({
                    pickuptime: driver.PoolStartTime,
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

                for (var i = 1; i < driver.AssignedRiders.length; i++) {
                    await RiderDB.update({
                        pickuptime: Riders.find(n => n.ID === driver.AssignedRiders[i]).PickupTime,
                    }, {
                        where: {
                            riderid: driver.AssignedRiders[i],
                            tripid: trip.id

                        }
                    }).catch(errHandler)



                }

                res.status(200).send("The trip is cancelled ")
                res.end()
            }

        } else {
            res.status(401).send("No trips found")
            res.end()
        }


    }

    DriversRider = []
    RiderRider = []
    DriversRidersDuration = []
    RiderRiderDuration = []
    Drivers = []
    Riders = []
})


function getters() {
    return { Riders, Drivers, RiderRider, RiderRiderDuration, DriversRidersDuration, DriversRider }
}




module.exports = { router, getters: getters }