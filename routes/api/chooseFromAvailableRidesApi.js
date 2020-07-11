const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const Offer = require('../../models/offerrideto')
const Request = require('../../models/requestrideto')

const requestRideFrom = require('../../models/requestridefrom')
const offerRideFrom = require('../../models/offerridefrom')

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

const matchingfare = require('../../modules/MatchingFareCalculator');

const chooseFromAvailableRides = require('../../modules/chooseFromAvailableRides');

const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');
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
        this.ExpectedFare = 0;

    }
};
class Driver {
    constructor(ID, DistanceToOrganization, ArrivalTime, TimeToOrganizationMinutes, capacity,
        EarliestStartTime, ridewith, smoking, toorgid, date, latitude, longitude) {

        this.ID = ID
        this.AssignedRiders = [];
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

        this.ExpectedFare = 0;
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

function validation(earliesttime) {
    var validChecks = true
    var message = ""
    if (earliesttime == "") {
        message = { error: "EarliestTime", message: "EarliestTime parameter is missing" }
        validChecks = false;

    } else if (!((typeof(earliesttime) === 'string') || ((earliesttime) instanceof String))) {
        validChecks = false;
        message = { error: "EarliestTime", message: "EarliestTime must be a string" }

    } else if ((earliesttime).trim().length === 0) {
        validChecks = false;
        message = { error: "EarliestTime", message: "EarliestTime can't be empty" }

    } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(earliesttime))) {
        validChecks = false;
        message = { error: "EarliestTime", message: "EarliestTime is invalid" }

    }
    return { validChecks: validChecks, message: message }

}
router.post('/', async(req, res) => {
    var DRDistanceDurationValue = []
    var RRDistanceDurationValue = []
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


        var result = validation(req.body.earliesttime)
        var invalidrider = 0;


        if (result.validChecks) {
            const Trip = await Trips.findOne({
                where: {
                    id: parseInt(req.body.tripid)
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

                //Check for request validity

                var error = false;
                const rides = await offerRideFrom.findAll({
                    where: {
                        userid: decoded.id,
                        status: {
                            [Op.or]: ["pending", "scheduled", "ongoing"]
                        }
                    }
                }).catch(errHandler)
                for (ride of rides) {
                    var reqStart = new Date((offer.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((offer.date.toString()) + " " + (offer.arrivaltime).toString());
                    var rideStart = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
                    var rideEnd = new Date((ride.date.toString()) + " " + (ride.latesttime).toString());
                    if ((rideStart <= reqStart) && (reqStart <= rideEnd)) {
                        error = true;
                    } else if ((rideStart <= reqEnd) && (reqEnd <= rideEnd)) {

                        error = true;
                    } else if ((reqStart <= rideEnd) && (rideEnd <= reqEnd)) {

                        error = true;
                    } else if ((reqStart <= rideStart) && (rideStart <= reqEnd)) {

                        error = true;
                    }
                }

                const rides2 = await Offer.findAll({
                    where: {
                        userid: decoded.id,
                        status: {
                            [Op.or]: ["pending", "scheduled", "ongoing"]
                        }
                    }
                }).catch(errHandler)


                for (ride of rides2) {
                    var reqStart = new Date((offer.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((offer.date.toString()) + " " + (offer.arrivaltime).toString());
                    var rideStart = new Date((ride.date.toString()) + " " + (ride.earliesttime).toString());
                    var rideEnd = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());

                    if ((rideStart <= reqStart) && (reqStart <= rideEnd)) {
                        error = true;
                    } else if ((rideStart <= reqEnd) && (reqEnd <= rideEnd)) {

                        error = true;
                    } else if ((reqStart <= rideEnd) && (rideEnd <= reqEnd)) {

                        error = true;
                    } else if ((reqStart <= rideStart) && (rideStart <= reqEnd)) {

                        error = true;
                    }

                }

                const rides3 = await Request.findAll({
                    where: {
                        userid: decoded.id,
                        status: {
                            [Op.or]: ["pending", "ongoing"]
                        }
                    }
                }).catch(errHandler)


                for (ride of rides3) {
                    var reqStart = new Date((offer.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((offer.date.toString()) + " " + (offer.arrivaltime).toString());
                    var rideStart = new Date((ride.date.toString()) + " " + (ride.earliesttime).toString());
                    var rideEnd = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());
                    if ((rideStart <= reqStart) && (reqStart <= rideEnd)) {
                        error = true;
                    } else if ((rideStart <= reqEnd) && (reqEnd <= rideEnd)) {

                        error = true;
                    } else if ((reqStart <= rideEnd) && (rideEnd <= reqEnd)) {

                        error = true;
                    } else if ((reqStart <= rideStart) && (rideStart <= reqEnd)) {

                        error = true;
                    }

                }

                const rides4 = await requestRideFrom.findAll({
                    where: {
                        userid: decoded.id,
                        status: {
                            [Op.or]: ["pending", "ongoing"]
                        }
                    }
                }).catch(errHandler)

                for (ride of rides4) {
                    var reqStart = new Date((offer.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((offer.date.toString()) + " " + (offer.arrivaltime).toString());
                    var rideStart = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
                    var rideEnd = new Date((ride.date.toString()) + " " + (ride.latesttime).toString());
                    if ((rideStart <= reqStart) && (reqStart <= rideEnd)) {
                        error = true;
                    } else if ((rideStart <= reqEnd) && (reqEnd <= rideEnd)) {

                        error = true;
                    } else if ((reqStart <= rideEnd) && (rideEnd <= reqEnd)) {

                        error = true;
                    } else if ((reqStart <= rideStart) && (rideStart <= reqEnd)) {

                        error = true;
                    }
                }

                /////////////////////////////////////
                if (error === false) {
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
                                        if (((user.gender === offer.ridewith) || (offer.ridewith === "any"))) {
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
                                                    tripid: Trip.id,
                                                    status: "scheduled"
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
                                                        var valueDistanceDuration = new values(driver.ID, Riders[rider].ID, parseFloat(FromDriverToRider.distance), Math.round(FromDriverToRider.time))
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
                                                    if (DRDistanceDurationValue[j].from === driverID) {
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
                                                        if (RRDistanceDurationValue[j].from === riderID) {
                                                            var distanceDurationObj = new distanceDuration(RRDistanceDurationValue[j].from, RRDistanceDurationValue[j].to, RRDistanceDurationValue[j].valueDistance, RRDistanceDurationValue[j].valueDuration);
                                                            RiderRow.push(distanceDurationObj);
                                                        }
                                                    }

                                                    if (RiderRow.length > 0) {
                                                        RidersRiders.push(RiderRow);
                                                    }


                                                }

                                                Drivers.push(driver)

                                                var z = await chooseFromAvailableRides();
                                                var p = await matchingfare('../routes/api/chooseFromAvailableRidesApi');
                                                if (Riders[Riders.length - 1].isAssigned === true) {
                                                    await Trips.update({
                                                        numberofseats: driver.AssignedRiders.length,
                                                    }, {
                                                        where: {
                                                            id: Trip.id

                                                        }
                                                    }).catch(errHandler)

                                                    await DriverDB.update({
                                                        pickuptime: driver.PoolStartTime,
                                                        expectedfare: driver.ExpectedFare
                                                    }, {
                                                        where: {
                                                            driverid: driver.ID,
                                                            tripid: Trip.id

                                                        }
                                                    }).catch(errHandler)




                                                    for (var i = 0; i < driver.AssignedRiders.length; i++) {
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
                                                                status: "scheduled",
                                                                expectedfare: Riders.find(n => n.ID === driver.AssignedRiders[i]).ExpectedFare


                                                            }).catch(errHandler)
                                                        } else {
                                                            await RiderDB.update({
                                                                pickuptime: Riders.find(n => n.ID === driver.AssignedRiders[i]).PickupTime,
                                                                expectedfare: Riders.find(n => n.ID === driver.AssignedRiders[i]).ExpectedFare
                                                            }, {
                                                                where: {
                                                                    riderid: driver.AssignedRiders[i],
                                                                    tripid: Trip.id

                                                                }
                                                            }).catch(errHandler)

                                                        }

                                                    }
                                                    res.status(200).send({ message: "You joined this ride" })
                                                } else {
                                                    res.status(400).send({ error: "Can't join this trip", message: "Your location or earliest time don't match" })
                                                    res.end()
                                                }

                                            } else {
                                                res.status(400).send({ error: "Can't join this trip", message: "You are already in this trip" })
                                                res.end();

                                            }
                                        } else {
                                            res.status(400).send({ error: "Can't join this trip", message: "Ridewith/Smoking don't match" })
                                            res.end();
                                        }


                                    }
                                }
                                if (countorg == 0) {
                                    res.status(400).send({ error: "Can't join this trip", message: "Not a memeber in organization" })
                                    res.end();
                                }

                            } else {
                                res.status(400).send({ error: "Can't join this trip", message: "Not a memeber in organization" })
                                res.end();

                            }
                        } else {
                            res.status(400).send({ error: "Can't join this trip", message: "You are a driver in it" })
                            res.end();

                        }
                    } else {
                        res.status(400).send({ error: "Can't join this trip", message: "No available seats" })
                        res.end()
                    }
                } else {
                    res.status(400).send({ error: "error", message: "You can't request two rides at the same time" });
                    res.end();
                }
            } else {
                res.status(400).send({ error: "tripid", message: "enter valid trip id" });
                res.end()
            }


        } else {
            res.status(400).send(result.message)
            res.end()
        }

    }

    DriversRiders = []
    RidersRiders = []
    Riders = []
    Drivers = []
    driver = {}


})

function getters() {
    return { Riders, driver, RidersRiders, DriversRiders, Drivers }
}


module.exports = { router, getters: getters, validation };