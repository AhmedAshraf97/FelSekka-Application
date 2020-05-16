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


class values {
    constructor(from, to, value) {
        this.from = from;
        this.to = to;
        this.value = value;
    }
}

class Rider {
    constructor(ID, DistanceToOrganization, ArrivalTime, TimeToOrganizationMinutes,
        EarliestPickup, ridewith, smoking, toorgid, date, requestid) {

        this.userID = ID
        this.ID = requestid;

        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = [] //todo:block
        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders

        this.EarliestPickup = EarliestPickup
            //Timing
        this.ArrivalTime = ArrivalTime
        this.PickupTime = this.ArrivalTime
        this.ridewith = ridewith
        this.smoking = smoking
        this.toorgid = toorgid
        this.date = date
        this.requestid = requestid

    }
};
class Driver {
    constructor(ID, DistanceToOrganization, ArrivalTime, TimeToOrganizationMinutes, capacity,
        EarliestStartTime, ridewith, smoking, toorgid, date, offerid, latitude, longitude) {

        this.userID = ID
        this.ID = offerid;
        this.AssignedRiders = [offerid];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.EarliestStartTime = EarliestStartTime
        this.capacity = capacity
        this.MaxDistance = 1.5 * DistanceToOrganization //removeee

        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders
        this.MaxEarliestDiffToNormalize = Number.NEGATIVE_INFINITY;

        //Timing
        this.PoolStartTime = new Date();
        this.ArrivalTime = ArrivalTime
        this.MaxDuration = diff_minutes(this.ArrivalTime, this.EarliestStartTime)


        this.ridewith = ridewith;
        this.smoking = smoking
        this.toorgid = toorgid
        this.date = date
        this.offerid = offerid
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

    const offers = await Offer.findAll({
        where: {
            status: 'pending'
        }
    }).catch(errHandler)
    if (offers.length > 0) {
        for (offer of offers) {
            const orguser = await OrgUser.findOne({
                where: {
                    orgid: offer.toorgid,
                    userid: offer.userid,
                    status: "existing"
                }

            }).catch(errHandler)

            var driver = new Driver(offer.userid, parseFloat(orguser.distancetoorg), new Date(offer.date + " " + offer.arrivaltime),
                Math.round(orguser.timetoorg),
                offer.numberofseats,
                new Date(offer.date + " " + offer.earliesttime),
                offer.ridewith,
                offer.smoking,
                offer.toorgid,
                new Date(offer.date),
                offer.id, parseFloat(offer.fromlatitude), parseFloat(offer.fromlongitude))

            Drivers.push(driver)
        }
        const requests = await Request.findAll({
            where: {
                status: 'pending'
            },
            attributes: ['id', 'userid', 'toorgid', 'arrivaltime', 'date', 'ridewith', 'smoking', 'earliesttime']
        }).catch(errHandler);

        if (requests.length > 0) {

            for (const request of requests) {
                const orguser = await OrgUser.findOne({
                    where: {
                        orgid: request.toorgid,
                        userid: request.userid,
                        status: "existing"
                    }
                }).catch(errHandler);

                var rider = new Rider(request.userid,
                    parseFloat(orguser.distancetoorg),
                    new Date(request.date + " " + request.arrivaltime),
                    Math.round(orguser.timetoorg),
                    new Date(request.date + " " + request.earliesttime),
                    request.ridewith,
                    request.smoking,
                    request.toorgid,
                    new Date(request.date),
                    request.id)

                Riders.push(rider);
            }
            if (Drivers.length > 0) {
                for (driver in Drivers) {
                    for (rider in Riders) {
                        if (Riders[rider].toorgid === Drivers[driver].toorgid && Riders[rider].ridewith === Drivers[driver].ridewith &&
                            Riders[rider].smoking === Drivers[driver].smoking &&
                            diff_minutes((Riders[rider].ArrivalTime), (Drivers[driver].ArrivalTime)) >= 0 &&
                            diff_minutes((Riders[rider].ArrivalTime), (Drivers[driver].ArrivalTime)) <= 30

                        ) {
                            const FromDriverToRider = await BetweenUsers.findOne({
                                where: {
                                    user1id: Drivers[driver].userID,
                                    user2id: Riders[rider].userID

                                }

                            }).catch(errHandler)
                            if (FromDriverToRider) {
                                var valueDuration = new values(Drivers[driver].ID, Riders[rider].ID, Math.round(FromDriverToRider.time))
                                var valueDistance = new values(Drivers[driver].ID, Riders[rider].ID, parseFloat(FromDriverToRider.distance))

                                DRdurationValue.push(valueDuration)
                                DRdistanceValue.push(valueDistance)
                                    /////////////////////////////////////////////////////////////
                                const FromRiderToDriver = await BetweenUsers.findOne({
                                    where: {

                                        user1id: Riders[rider].userID,
                                        user2id: Drivers[driver].userID

                                    }

                                }).catch(errHandler)

                                if (FromRiderToDriver.trust === 1) {
                                    Riders[rider].TrustedDrivers.push(Drivers[driver].ID)
                                } else if (FromRiderToDriver.trust === -1) {
                                    Riders[rider].UnTrustedDrivers.push(Drivers[driver].ID)
                                }

                            }

                        }

                    }

                }
            }

            if (DRdurationValue.length != 0) {
                if (Riders.length > 0) {
                    for (riderFrom in Riders) {
                        for (riderTo in Riders) {
                            if (Riders[riderFrom].userID !== Riders[riderTo].userID && Riders[riderFrom].toorgid === Riders[riderTo].toorgid && Riders[riderFrom].ridewith === Riders[riderTo].ridewith &&
                                Riders[riderFrom].smoking === Riders[riderTo].smoking &&
                                diff_minutes((Riders[riderFrom].ArrivalTime), (Riders[riderTo].ArrivalTime)) >= -30 &&
                                diff_minutes((Riders[riderFrom].ArrivalTime), (Riders[riderTo].ArrivalTime)) <= 30

                            ) {

                                const FromRiderToRider = await BetweenUsers.findOne({
                                    where: {
                                        user1id: Riders[riderFrom].userID,
                                        user2id: Riders[riderTo].userID

                                    }

                                }).catch(errHandler)
                                if (FromRiderToRider) {
                                    var valueDuration = new values(Riders[riderFrom].ID, Riders[riderTo].ID, Math.round(FromRiderToRider.time))
                                    var valueDistance = new values(Riders[riderFrom].ID, Riders[riderTo].ID, parseFloat(FromRiderToRider.distance))

                                    RRdurationValue.push(valueDuration)
                                    RRdistanceValue.push(valueDistance)
                                }

                            }

                        }

                    }
                }


                for (var i = 0; i < Drivers.length; i++) { //get id's from offers
                    var driverID = Drivers[i].ID
                    var DriverRow = new userArray(driverID);

                    for (var j = 0; j < DRdistanceValue.length; j++) {
                        if (DRdistanceValue[j].from === driverID) {
                            var distanceObj = new distance(DRdistanceValue[j].from, DRdistanceValue[j].to, DRdistanceValue[j].value);
                            Drivers[i].MaxDistanceToNormalize = Math.max(DRdistanceValue[j].value, Drivers[i].MaxDistanceToNormalize)
                            DriverRow.push(distanceObj);
                        }

                    }

                    if (Drivers[i].MaxDistanceToNormalize <= 0)
                        Drivers[i].MaxDistanceToNormalize = 1;
                    if (DriverRow.length > 0) {
                        DriversRider.push(DriverRow);
                    }


                }

                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);
                    for (var j = 0; j < RRdistanceValue.length; j++) {
                        if (RRdistanceValue[j].from === riderID) {
                            var distanceObj = new distance(RRdistanceValue[j].from, RRdistanceValue[j].to, RRdistanceValue[j].value);
                            Riders[i].MaxDistanceToNormalize = Math.max(RRdistanceValue[j].value, Riders[i].MaxDistanceToNormalize)
                            RiderRow.push(distanceObj);
                        }
                    }
                    if (Riders[i].MaxDistanceToNormalize <= 0)
                        Riders[i].MaxDistanceToNormalize = 1;
                    if (RiderRow.length > 0) {
                        RiderRider.push(RiderRow);
                    }


                }


                for (var i = 0; i < Drivers.length; i++) { //get id's from offers

                    var driverID = Drivers[i].ID
                    var DriverRowDuration = new userArray(driverID);
                    var diffEarliest
                    for (var j = 0; j < DRdurationValue.length; j++) {
                        if (DRdurationValue[j].from === driverID) {
                            var durationObj = new duration(DRdurationValue[j].from, DRdurationValue[j].to, DRdurationValue[j].value);
                            Drivers[i].MaxDurationToNormalize = Math.max(DRdurationValue[j].value, Drivers[i].MaxDurationToNormalize)
                            diffEarliest = diff_minutes(Riders.find(n => n.ID === DRdurationValue[j].to).EarliestPickup, Drivers[i].EarliestStartTime) - DRdurationValue[j].value
                            Drivers[i].MaxEarliestDiffToNormalize = Math.max(diffEarliest, Drivers[i].MaxEarliestDiffToNormalize)

                            DriverRowDuration.push(durationObj);
                        }

                    }
                    if (Drivers[i].MaxDurationToNormalize <= 0)
                        Drivers[i].MaxDurationToNormalize = 1;

                    if (Drivers[i].MaxEarliestDiffToNormalize <= 0)
                        Drivers[i].MaxEarliestDiffToNormalize = 1;
                    if (DriverRowDuration.length > 0) {

                        DriversRidersDuration.push(DriverRowDuration);
                    }


                }


                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRowDuration = new userArray(riderID);

                    for (var j = 0; j < RRdurationValue.length; j++) {
                        if (RRdurationValue[j].from === riderID) {
                            var durationObj = new duration(RRdurationValue[j].from, RRdurationValue[j].to, RRdurationValue[j].value);
                            Riders[i].MaxDurationToNormalize = Math.max(RRdurationValue[j].value, Riders[i].MaxDurationToNormalize)
                            RiderRowDuration.push(durationObj);
                        }
                    }

                    if (Riders[i].MaxDurationToNormalize <= 0)
                        Riders[i].MaxDurationToNormalize = 1;
                    if (RiderRowDuration.length > 0) {

                        RiderRiderDuration.push(RiderRowDuration);
                    }


                }


                var z = await matching();
                var countAssigned = 0;

                for (var i = 0; i < Drivers.length; i++) {
                    if (Drivers[i].AssignedRiders.length > 1) {
                        countAssigned++;
                        const organization = await Organization.findOne({
                            where: {
                                id: Drivers[i].toorgid,
                                status: "existing"
                            }
                        }).catch(errHandler);
                        const trip = await Trips.create({
                            tofrom: "to",
                            starttime: 0,
                            endtime: 0,
                            startloclatitude: Drivers[i].latitude,
                            startloclongitude: Drivers[i].longitude,
                            endloclatitude: organization.latitude,
                            endloclongitude: organization.longitude,
                            totaldistance: 0,
                            totaltime: 0,
                            totalfare: 0,
                            numberofseats: Drivers[i].AssignedRiders.length - 1,
                            date: Drivers[i].date,
                            status: "scheduled"

                        }).catch(errHandler)
                        await DriverDB.create({
                            tripid: trip.id,
                            tofrom: "to",
                            offerid: Drivers[i].offerid,
                            driverid: Drivers[i].userID,
                            pickuptime: Drivers[i].PoolStartTime,
                            arrivaltime: Drivers[i].ArrivalTime,
                            actualpickuptime: 0,
                            actualarrivaltime: 0,
                            distance: 0,
                            time: 0,
                            fare: 0,
                            status: "scheduled"


                        }).catch(errHandler)
                        await Offer.update({ status: "scheduled" }, {
                            where: {
                                id: Drivers[i].offerid
                            }
                        }).catch(errHandler)
                        for (var j = 1; j < Drivers[i].AssignedRiders.length; j++) {
                            await RiderDB.create({

                                tripid: trip.id,
                                tofrom: "to",
                                offerid: Drivers[i].offerid,
                                requestid: Drivers[i].AssignedRiders[j],
                                riderid: Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).userID,
                                pickuptime: Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).PickupTime,
                                arrivaltime: Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).ArrivalTime,
                                actualpickuptime: 0,
                                actualarrivaltime: 0,
                                distance: 0,
                                time: 0,
                                fare: 0,
                                status: "scheduled"

                            }).catch(errHandler)
                            await Request.update({ status: "scheduled" }, {
                                where: {
                                    id: Drivers[i].AssignedRiders[j]
                                }
                            }).catch(errHandler)
                        }

                    }
                }

                if (countAssigned === 0) {
                    res.status(400).send("No trips will be scheduled")
                    res.end()
                } else {
                    res.status(200).send("Matching Done")
                    res.end()

                }
            } else {
                res.status(400).send("No trips will be scheduled")
            }
        } else {
            res.status(400).send("no requests")
        }
    } else {
        res.status(400).send("no offers")
    }

    DriversRider = []
    RiderRider = []
    DriversRidersDuration = []
    RiderRiderDuration = []
    Drivers = []
    Riders = []

});

function getters() {
    return { Riders, Drivers, RiderRider, RiderRiderDuration, DriversRidersDuration, DriversRider }
}




module.exports = { router, getters: getters }