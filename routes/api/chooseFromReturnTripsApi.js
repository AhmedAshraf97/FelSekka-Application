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

const chooseFromAvailableRides = require('../../chooseFromReturnTrips');

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

    }
};
class Driver {
    constructor(ID, DistanceFromOrganization, PoolStartTime, TimeFromOrganizationMinutes, capacity,
        LatestDropOff, ridewith, smoking, fromorgid, date, latitude, longitude) {


        this.ID = ID
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;

        this.LatestDropOff = LatestDropOff
        this.capacity = capacity
        this.MaxDistance = 1.5 * DistanceFromOrganization //removeee


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
        ValidChecks = false
        res.status(401).send({ message: "You aren't authorized to choose from available rides " })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to choose from available rides " })
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

    var invalidrider = 0;




    if (ValidChecks) {
        if (req.body.latesttime == "") {
            res.status(400).send({ error: "LatestTime", message: "LatestTime paramter is missing" });
            ValidChecks = false;
            res.end()
        } else if (!((typeof(req.body.latesttime) === 'string') || ((req.body.latesttime) instanceof String))) {
            ValidChecks = false;

            res.status(400).send({ error: "LatestTime", message: "LatestTime must be a string" });
            res.end()
        } else if ((req.body.latesttime).trim().length === 0) {
            ValidChecks = false;
            res.status(400).send({ error: "LatestTime", message: "LatestTime can't be empty" });
            res.end()
        } else if (!(/^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(req.body.latesttime))) {
            res.status(400).send({ error: "LatestTime", message: "LatestTime is unvalid" });
            ValidChecks = false;
            res.end();
        }




        if (ValidChecks) {
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

                if (offer.numberofseats > Trip.numberofseats) {
                    if (user.id !== DriverTrip.driverid) {
                        const orguserdecoded = await OrgUser.findAll({
                            where: {

                                userid: user.id,
                                status: "existing"
                            }

                        }).catch(errHandler)
                        var countfromorg = 0;
                        if (orguserdecoded.length > 0) {
                            for (const org of orguserdecoded) {
                                if (org.orgid === offer.fromorgid) {
                                    countfromorg++;
                                    if (offer.gender === offer.ridewith) {
                                        const orguser = await OrgUser.findOne({
                                            where: {
                                                orgid: offer.fromorgid,
                                                userid: offer.userid,
                                                status: "existing"
                                            }

                                        }).catch(errHandler)


                                        driver = new Driver(offer.userid, parseFloat(orguser.distancefromorg), new Date(offer.date + " " + offer.departuretime),
                                            parseFloat(orguser.timefromorg),
                                            offer.numberofseats,
                                            new Date(offer.date + " " + offer.latesttime),
                                            offer.ridewith,
                                            offer.smoking,
                                            offer.fromorgid,
                                            new Date(offer.date), parseFloat(offer.tolatitude), parseFloat(offer.tolongitude))
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
                                                            orgid: offer.fromorgid,
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
                                                        parseFloat(orguser.distancefromorg),
                                                        new Date(request.date + " " + request.departuretime),
                                                        parseFloat(orguser.timefromorg),
                                                        new Date(request.date + " " + request.latesttime),
                                                        request.ridewith,
                                                        request.smoking,
                                                        request.fromorgid,
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
                                                parseFloat(org.distancefromorg),
                                                new Date(offer.date + " " + offer.departuretime),
                                                parseFloat(org.timefromorg),
                                                new Date(offer.date + " " + req.body.latesttime),
                                                offer.ridewith,
                                                offer.smoking,
                                                offer.fromorgid,
                                                new Date(offer.date))
                                            Riders.push(rider);
                                            driver.AssignedRiders.push(user.id)
                                            for (rider in Riders) {

                                                const FromRiderToDriver = await BetweenUsers.findOne({
                                                    where: {
                                                        user2id: driver.ID,
                                                        user1id: Riders[rider].ID

                                                    }

                                                }).catch(errHandler)
                                                if (FromRiderToDriver) {
                                                    var valueDuration = new values(Riders[rider].ID, driver.ID, parseFloat(FromRiderToDriver.time))
                                                    var valueDistance = new values(Riders[rider].ID, driver.ID, parseFloat(FromRiderToDriver.distance))

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
                                                if (DRdistanceValue[j].to === driverID) {
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
                                                    if (RRdistanceValue[j].to === riderID) {
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
                                                if (DRdurationValue[j].to === driverID) {
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
                                                    if (RRdurationValue[j].to === riderID) {
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
                                                    arrivaltime: driver.DropOffTime,
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
                                                            tolatitude: user.latitude,
                                                            tolongitude: user.longitude,
                                                            fromorgid: offer.fromorgid,
                                                            date: offer.date,
                                                            departuretime: offer.departuretime,
                                                            ridewith: offer.ridewith,
                                                            smoking: offer.smoking,
                                                            latesttime: req.body.latesttime,
                                                            status: "scheduled"
                                                        }
                                                        const newRequest = await Request.create(rideData)
                                                            .catch(errHandler);
                                                        await RiderDB.create({

                                                            tripid: Trip.id,
                                                            tofrom: "from",
                                                            offerid: offer.id,
                                                            requestid: newRequest.id,
                                                            riderid: user.id,
                                                            arrivaltime: Riders.find(n => n.ID === driver.AssignedRiders[i]).DropOffTime,
                                                            pickuptime: offer.departuretime,
                                                            actualpickuptime: 0,
                                                            actualarrivaltime: 0,
                                                            distance: 0,
                                                            time: 0,
                                                            fare: 0,
                                                            status: "scheduled"

                                                        }).catch(errHandler)
                                                    } else {
                                                        await RiderDB.update({
                                                            arrivaltime: Riders.find(n => n.ID === driver.AssignedRiders[i]).DropOffTime,
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
                                                res.status(400).send("You can't be assigned in this trip")
                                                res.end()
                                            }

                                        } else {
                                            res.status(400).send("You are already assigned in this trip")
                                            res.end();

                                        }
                                    } else {
                                        res.status(400).send("Trip options aren't stuiable for you")
                                        res.end();
                                    }


                                }
                            }
                            if (countfromorg == 0) {
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
                res.status(400).send({ error: "tripid", message: "Invalid trip id, Enter a valid trip id" });
                res.end()
            }








        }



        DriversRider = []
        RiderRider = []
        DriversRidersDuration = []
        RiderRiderDuration = []
        Riders = []
        Drivers = []
        driver = {}

    }
})


function getters() {
    return { Riders, driver, RiderRider, RiderRiderDuration, DriversRidersDuration, DriversRider }
}


module.exports = { router, getters: getters };