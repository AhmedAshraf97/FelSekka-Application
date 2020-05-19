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
    constructor(from, to, valueDistance, valueDuration) {
        this.from = from;
        this.to = to;
        this.valueDistance = valueDistance;
        this.valueDuration = valueDuration
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

        this.MaxDistanceToNormalizeDrivers = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalizeDrivers = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders

        this.MaxDistanceToNormalizeRiders = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalizeRiders = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders


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

        this.closestFlag = 0
        this.skipFlag = 0;
        this.countRiders = 0;
        this.countDrivers = 0
    }
};


/* class distance {
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

} */

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

var AllDriversToRider = []
var AllRidersToRider = []

var DriversRiders = new Array();
var RidersRiders = new Array();



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

    var DRDistanceDurationValue = []
    var RRDistanceDurationValue = []

    const offers = await Offer.findAll({
        where: {
            status: 'pending'
        }
    }).catch(errHandler)

    if (offers.length > 0) {

        const OrgUsersObject = await OrgUser.findAll({ where: { status: "existing" } }).catch(errHandler)
        for (offer of offers) {

            const orguser = OrgUsersObject.find(n => n.orgid === offer.toorgid && n.userid === offer.userid)

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

                const orguser = OrgUsersObject.find(n => n.orgid === request.toorgid && n.userid === request.userid)

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

            const betweenUsersObject = await BetweenUsers.findAll({}).catch(errHandler);


            if (Drivers.length > 0) {
                for (driver in Drivers) {
                    for (rider in Riders) {
                        if (Riders[rider].toorgid === Drivers[driver].toorgid && Riders[rider].ridewith === Drivers[driver].ridewith &&
                            Riders[rider].smoking === Drivers[driver].smoking &&
                            diff_minutes((Riders[rider].ArrivalTime), (Drivers[driver].ArrivalTime)) >= 0 &&
                            diff_minutes((Riders[rider].ArrivalTime), (Drivers[driver].ArrivalTime)) <= 30

                        ) {
                            const FromDriverToRider = betweenUsersObject.find(n => n.user1id === Drivers[driver].userID && n.user2id === Riders[rider].userID)
                            if (FromDriverToRider) {
                                var valueDistanceDuration = new values(Drivers[driver].ID, Riders[rider].ID, parseFloat(FromDriverToRider.distance), Math.round(FromDriverToRider.time))

                                DRDistanceDurationValue.push(valueDistanceDuration)

                                const FromRiderToDriver = betweenUsersObject.find(n => n.user1id === Riders[rider].userID && n.user2id === Drivers[driver].userID)

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

            if (DRDistanceDurationValue.length != 0) {
                if (Riders.length > 0) {
                    for (riderFrom in Riders) {
                        for (riderTo in Riders) {
                            if (Riders[riderFrom].userID !== Riders[riderTo].userID && Riders[riderFrom].toorgid === Riders[riderTo].toorgid && Riders[riderFrom].ridewith === Riders[riderTo].ridewith &&
                                Riders[riderFrom].smoking === Riders[riderTo].smoking &&
                                diff_minutes((Riders[riderFrom].ArrivalTime), (Riders[riderTo].ArrivalTime)) >= -30 &&
                                diff_minutes((Riders[riderFrom].ArrivalTime), (Riders[riderTo].ArrivalTime)) <= 30

                            ) {

                                const FromRiderToRider = betweenUsersObject.find(n => n.user1id === Riders[riderFrom].userID && n.user2id === Riders[riderTo].userID)

                                if (FromRiderToRider) {
                                    var valueDistanceDuration = new values(Riders[riderFrom].ID, Riders[riderTo].ID, parseFloat(FromRiderToRider.distance), Math.round(FromRiderToRider.time))
                                    RRDistanceDurationValue.push(valueDistanceDuration)
                                }

                            }

                        }

                    }
                }


                for (var i = 0; i < Drivers.length; i++) {
                    var driverID = Drivers[i].ID
                    var DriverRow = new userArray(driverID);
                    var diffEarliest

                    for (var j = 0; j < DRDistanceDurationValue.length; j++) {
                        if (DRDistanceDurationValue[j].from === driverID) {
                            var distanceDurationObj = new distanceDuration(DRDistanceDurationValue[j].from, DRDistanceDurationValue[j].to, DRDistanceDurationValue[j].valueDistance, DRDistanceDurationValue[j].valueDuration);
                            Drivers[i].MaxDistanceToNormalize = Math.max(DRDistanceDurationValue[j].valueDistance, Drivers[i].MaxDistanceToNormalize)
                            Drivers[i].MaxDurationToNormalize = Math.max(DRDistanceDurationValue[j].valueDuration, Drivers[i].MaxDurationToNormalize)
                            diffEarliest = diff_minutes(Riders.find(n => n.ID === DRDistanceDurationValue[j].to).EarliestPickup, Drivers[i].EarliestStartTime) - DRDistanceDurationValue[j].valueDuration
                            Drivers[i].MaxEarliestDiffToNormalize = Math.max(diffEarliest, Drivers[i].MaxEarliestDiffToNormalize)
                            DriverRow.push(distanceDurationObj);
                        }

                    }

                    if (Drivers[i].MaxDistanceToNormalize <= 0)
                        Drivers[i].MaxDistanceToNormalize = 1;
                    if (Drivers[i].MaxDurationToNormalize <= 0)
                        Drivers[i].MaxDurationToNormalize = 1;

                    if (Drivers[i].MaxEarliestDiffToNormalize <= 0)
                        Drivers[i].MaxEarliestDiffToNormalize = 1;
                    if (DriverRow.length > 0) {
                        DriversRiders.push(DriverRow);
                    }


                }
                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);

                    for (var j = 0; j < RRDistanceDurationValue.length; j++) {
                        if (RRDistanceDurationValue[j].from === riderID) {
                            var distanceDurationObj = new distanceDuration(RRDistanceDurationValue[j].from, RRDistanceDurationValue[j].to, RRDistanceDurationValue[j].valueDistance, RRDistanceDurationValue[j].valueDuration);
                            Riders[i].MaxDurationToNormalize = Math.max(RRDistanceDurationValue[j].valueDuration, Riders[i].MaxDurationToNormalize)
                            Riders[i].MaxDistanceToNormalize = Math.max(RRDistanceDurationValue[j].valueDistance, Riders[i].MaxDistanceToNormalize)
                            RiderRow.push(distanceDurationObj);
                        }
                    }
                    if (Riders[i].MaxDistanceToNormalize <= 0)
                        Riders[i].MaxDistanceToNormalize = 1;
                    if (Riders[i].MaxDurationToNormalize <= 0)
                        Riders[i].MaxDurationToNormalize = 1;
                    if (RiderRow.length > 0) {

                        RidersRiders.push(RiderRow);
                    }


                }



                for (var i = 0; i < Riders.length; i++) { //get id's from offers
                    var RiderID = Riders[i].ID
                    var RiderRow = new userArray(RiderID);

                    for (var j = 0; j < DRDistanceDurationValue.length; j++) {
                        if (DRDistanceDurationValue[j].to === RiderID) {
                            var distanceDurationObj = new distanceDuration(DRDistanceDurationValue[j].from, DRDistanceDurationValue[j].to, DRDistanceDurationValue[j].valueDistance, DRDistanceDurationValue[j].valueDuration);
                            Riders[i].MaxDistanceToNormalizeDrivers = Math.max(DRDistanceDurationValue[j].valueDistance, Riders[i].MaxDistanceToNormalizeDrivers)

                            Riders[i].MaxDurationToNormalizeDrivers = Math.max(DRDistanceDurationValue[j].valueDuration, Riders[i].MaxDurationToNormalizeDrivers)

                            RiderRow.push(distanceDurationObj);
                        }
                    }
                    if (Riders[i].MaxDistanceToNormalizeDrivers <= 0)
                        Riders[i].MaxDistanceToNormalizeDrivers = 1;
                    if (Riders[i].MaxDurationToNormalizeDrivers <= 0)
                        Riders[i].MaxDurationToNormalizeDrivers = 1;
                    if (RiderRow.length > 0) {
                        AllDriversToRider.push(RiderRow);
                    }

                }



                for (var i = 0; i < Riders.length; i++) {

                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);
                    for (var j = 0; j < RRDistanceDurationValue.length; j++) {
                        if (RRDistanceDurationValue[j].to === riderID) {
                            var distanceDurationObj = new distanceDuration(RRDistanceDurationValue[j].from, RRDistanceDurationValue[j].to, RRDistanceDurationValue[j].valueDistance, RRDistanceDurationValue[j].valueDuration);
                            Riders[i].MaxDistanceToNormalizeRiders = Math.max(RRDistanceDurationValue[j].valueDistance, Riders[i].MaxDistanceToNormalizeRiders)

                            Riders[i].MaxDurationToNormalizeRiders = Math.max(RRDistanceDurationValue[j].valueDuration, Riders[i].MaxDurationToNormalizeRiders)
                            RiderRow.push(distanceDurationObj);
                        }
                    }
                    if (Riders[i].MaxDistanceToNormalizeRiders <= 0)
                        Riders[i].MaxDistanceToNormalizeRiders = 1;
                    if (Riders[i].MaxDurationToNormalizeRiders <= 0)
                        Riders[i].MaxDurationToNormalizeRiders = 1;
                    if (RiderRow.length > 0) {
                        AllRidersToRider.push(RiderRow);
                    }


                }


                var z = await matching();
                var countAssigned = 0;


                const organizationObj = await Organization.findAll({
                    where: {
                        status: "existing"
                    }
                }).catch(errHandler);

                for (var i = 0; i < Drivers.length; i++) {
                    const organization = organizationObj.find(n => n.id === Drivers[i].toorgid);
                    if (Drivers[i].AssignedRiders.length > 1) {
                        countAssigned++;
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

    AllDriversToRider = []

    AllRidersToRider = []

    DriversRiders = []
    RidersRiders = []
    Drivers = []
    Riders = []

});

function getters() {
    return {
        Riders,
        Drivers,
        RidersRiders,
        DriversRiders,
        AllDriversToRider,
        AllRidersToRider
    }
}




module.exports = { router, getters: getters }