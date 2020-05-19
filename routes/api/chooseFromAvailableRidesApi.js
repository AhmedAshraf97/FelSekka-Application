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

const chooseFromAvailableRides = require('../../chooseFromAvailableRides');

const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');
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



var Riders = []

var driver;
var Drivers = []

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
    var DRdistanceValue = []
    var DRdurationValue = []
    var RRdistanceValue = []
    var RRdurationValue = []
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized to choose from avilable rides" })
        res.end();
    }


    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to choose from avilable rides" })
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

        if (req.body.earliesttime == "") {
            res.status(400).send({ error: "EarliestTime", message: "EarliestTime paramter is missing" });
            ValidChecks = false;
            res.end()
        } else if (!((typeof(req.body.earliesttime) === 'string') || ((req.body.earliesttime) instanceof String))) {
            ValidChecks = false;

            res.status(400).send({ error: "EarliestTime", message: "EarliestTime must be a string" });
            res.end()
        } else if ((req.body.earliesttime).trim().length === 0) {
            ValidChecks = false;
            res.status(400).send({ error: "EarliestTime", message: "EarliestTime can't be empty" });
            res.end()
        } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(req.body.earliesttime))) {
            res.status(400).send({ error: "EarliestTime", message: "EarliestTime is unvalid" });
            ValidChecks = false;
            res.end();
        }





        var invalidrider = 0;


        if (ValidChecks) {
            const Trip = await Trips.findOne({
                where: {
                    id: req.body.tripid
                }
            }).catch(errHandler)
            if (Trip) {
                const DriverTrip = await DriverDB.findOne({
                    where: {
                        tripid: Trip.id
                    }
                }).catch(errHandler)

                const offer = await Offer.findOne({
                    where: {
                        id: DriverTrip.offerid
                    }
                }).catch(errHandler)

                if (offer.numberofseats > Trip.numberofseats) {
                    if (user.id !== DriverTrip.driverid) {
                        const orguserdecoded = await OrgUser.findAll({
                            where: {

                                userid: user.id,
                                status: "existing"
                            }

                        }).catch(errHandler)
                        var countorg = 0;
                        if (orguserdecoded.length > 0) {
                            for (const org of orguserdecoded) {
                                if (org.orgid === offer.toorgid) {
                                    countorg++;
                                    if (user.gender === offer.ridewith) {
                                        const orguser = await OrgUser.findOne({
                                            where: {
                                                orgid: offer.toorgid,
                                                userid: offer.userid,
                                                status: "existing"
                                            }

                                        }).catch(errHandler)


                                        driver = new Driver(offer.userid, parseFloat(orguser.distancetoorg), new Date(offer.date + " " + offer.arrivaltime),
                                            parseFloat(orguser.timetoorg),
                                            offer.numberofseats,
                                            new Date(offer.date + " " + offer.earliesttime),
                                            offer.ridewith,
                                            offer.smoking,
                                            offer.toorgid,
                                            new Date(offer.date), parseFloat(offer.fromlatitude), parseFloat(offer.fromlongitude))
                                        driver.TotalDurationTaken = diff_minutes(new Date(offer.date + " " + DriverTrip.arrivaltime), new Date(offer.date + " " + DriverTrip.pickuptime))

                                        const RidersTrips = await RiderDB.findAll({
                                            where: {
                                                tripid: Trip.id
                                            }
                                        }).catch(errHandler);
                                        if (RidersTrips.length > 0) {

                                            for (const riderTrip of RidersTrips) {

                                                if (user.id !== riderTrip.riderid) {
                                                    const orguser = await OrgUser.findOne({
                                                        where: {
                                                            orgid: offer.toorgid,
                                                            userid: riderTrip.riderid,
                                                            status: "existing"
                                                        }
                                                    }).catch(errHandler);

                                                    const request = await Request.findOne({
                                                        where: {
                                                            id: riderTrip.requestid
                                                        }
                                                    }).catch(errHandler)
                                                    var rider = new Rider(request.userid,
                                                        parseFloat(orguser.distancetoorg),
                                                        new Date(request.date + " " + request.arrivaltime),
                                                        parseFloat(orguser.timetoorg),
                                                        new Date(request.date + " " + request.earliesttime),
                                                        request.ridewith,
                                                        request.smoking,
                                                        request.toorgid,
                                                        new Date(request.date))

                                                    Riders.push(rider);
                                                    driver.AssignedRiders.push(request.userid)
                                                } else {
                                                    invalidrider = 1;
                                                }



                                            }

                                        }
                                        if (invalidrider === 0) {
                                            var rider = new Rider(user.id,
                                                parseFloat(org.distancetoorg),
                                                new Date(offer.date + " " + offer.arrivaltime),
                                                parseFloat(org.timetoorg),
                                                new Date(offer.date + " " + req.body.earliesttime),
                                                offer.ridewith,
                                                offer.smoking,
                                                offer.toorgid,
                                                new Date(offer.date))
                                            Riders.push(rider);
                                            driver.AssignedRiders.push(user.id)
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
                                            Drivers.push(driver)

                                            var z = await chooseFromAvailableRides();
                                            if (Riders[Riders.length - 1].isAssigned === true) {
                                                await Trips.update({
                                                    numberofseats: driver.AssignedRiders.length - 1,
                                                }, {
                                                    where: {
                                                        id: Trip.id

                                                    }
                                                }).catch(errHandler)

                                                await DriverDB.update({
                                                    pickuptime: driver.PoolStartTime,
                                                }, {
                                                    where: {
                                                        driverid: driver.ID,
                                                        tripid: Trip.id

                                                    }
                                                }).catch(errHandler)




                                                for (var i = 1; i < driver.AssignedRiders.length; i++) {
                                                    if (driver.AssignedRiders[i] === user.id) {

                                                        const rideData = {
                                                            userid: user.id,
                                                            fromlatitude: user.latitude,
                                                            fromlongitude: user.longitude,
                                                            toorgid: offer.toorgid,
                                                            date: offer.date,
                                                            arrivaltime: offer.arrivaltime,
                                                            ridewith: offer.ridewith,
                                                            smoking: offer.smoking,
                                                            earliesttime: req.body.earliesttime,
                                                            status: "scheduled"
                                                        }
                                                        const newRequest = await Request.create(rideData)
                                                            .catch(errHandler);
                                                        await RiderDB.create({

                                                            tripid: Trip.id,
                                                            tofrom: "to",
                                                            offerid: offer.id,
                                                            requestid: newRequest.id,
                                                            riderid: user.id,
                                                            pickuptime: Riders.find(n => n.ID === driver.AssignedRiders[i]).PickupTime,
                                                            arrivaltime: offer.arrivaltime,
                                                            actualpickuptime: 0,
                                                            actualarrivaltime: 0,
                                                            distance: 0,
                                                            time: 0,
                                                            fare: 0,
                                                            status: "scheduled"

                                                        }).catch(errHandler)
                                                    } else {
                                                        await RiderDB.update({
                                                            pickuptime: Riders.find(n => n.ID === driver.AssignedRiders[i]).PickupTime,
                                                        }, {
                                                            where: {
                                                                riderid: driver.AssignedRiders[i],
                                                                tripid: Trip.id

                                                            }
                                                        }).catch(errHandler)

                                                    }

                                                }
                                                res.status(200).send("Ride is chosen successfully")
                                            } else {
                                                res.status(400).send("you can't be assigned in this trip")
                                                res.end()
                                            }

                                        } else {
                                            res.status(400).send("you are already assigned in this trip")
                                            res.end();

                                        }
                                    } else {
                                        res.status(400).send("trip option isn't stuiable for you")
                                        res.end();
                                    }


                                }
                            }
                            if (countorg == 0) {
                                res.status(400).send("You aren't a member in this organization")
                                res.end();
                            }

                        } else {
                            res.status(400).send("You aren't a member in this organization")
                            res.end();

                        }
                    } else {
                        res.status(400).send("You are a driver in this trip")
                        res.end();

                    }
                } else {
                    res.status(400).send("No available seats in this trip")
                    res.end()
                }
            } else {
                res.status(400).send({ error: "tripid", message: "enter valid trip id" });
                res.end()
            }


        }

    }

    DriversRider = []
    RiderRider = []
    DriversRidersDuration = []
    RiderRiderDuration = []
    Riders = []
    Drivers = []
    driver = {}


})

function getters() {
    return { Riders, driver, RiderRider, RiderRiderDuration, DriversRidersDuration, DriversRider }
}


module.exports = { router, getters: getters };