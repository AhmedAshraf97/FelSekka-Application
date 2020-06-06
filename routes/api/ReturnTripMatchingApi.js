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
const ReturnTripMatching = require('../../ReturnTripMatching');
const ReturnTripMatchingFare = require('../../ReturnMatchingFareCalculator');
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
    constructor(ID, DistanceFromOrganization, DepartureTime, TimeFromOrganizationMinutes,
        LatestDropOff, ridewith, smoking, fromorgid, date, requestid) {

        this.userID = ID
        this.ID = requestid;

        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = [] //todo:block
        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders

        this.MaxDistanceToNormalizeRiders = Number.NEGATIVE_INFINITY;
        this.MaxDurationToNormalizeRiders = Number.NEGATIVE_INFINITY;
        this.MaxDistanceToNormalizeDrivers = Number.NEGATIVE_INFINITY;
        this.MaxDurationToNormalizeDrivers = Number.NEGATIVE_INFINITY;


        this.ExpectedFare = 0
        this.LatestDropOff = LatestDropOff
            //Timing
        this.DepartureTime = DepartureTime
        this.DropOffTime = this.DepartureTime
        this.ridewith = ridewith
        this.smoking = smoking
        this.fromorgid = fromorgid
        this.date = date
        this.requestid = requestid

    }
};
class Driver {
    constructor(ID, DistanceFromOrganization, PoolStartTime, TimeFromOrganizationMinutes, capacity,
        LatestDropOff, ridewith, smoking, fromorgid, date, offerid, latitude, longitude) {

        this.userID = ID
        this.ID = offerid;
        this.AssignedRiders = [];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;

        this.LatestDropOff = LatestDropOff
        this.capacity = capacity
        this.MaxDistance = 1.5 * DistanceFromOrganization //removeee

        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders
        this.MaxDropoffDiffToNormalize = Number.NEGATIVE_INFINITY;
        this.status = 0
        this.countDrivers = 0

        this.ExpectedFare = 0
        this.countRiders = 0
            //Timing
        this.DropOffTime = this.PoolStartTime
        this.PoolStartTime = PoolStartTime
        this.MaxDuration = diff_minutes(this.LatestDropOff, this.PoolStartTime)



        this.ridewith = ridewith;
        this.smoking = smoking
        this.fromorgid = fromorgid
        this.date = date
        this.offerid = offerid
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

var FromRiderToAllDrivers = []
var FromRiderToAllRiders = []

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



    const offers = await Offer.findAll({
        where: {
            status: 'pending'
        }
    }).catch(errHandler)

    var OffersArray = []
    var RequestsArray = []
    if (offers.length > 0) {

        for (offer of offers) {
            OffersArray.push(offer.userid)
        }

        const orguserObj = await OrgUser.findAll({
            where: {
                status: "existing",
                userid: {
                    [Op.in]: OffersArray
                }
            }

        }).catch(errHandler)

        for (offer of offers) {
            const orguser = orguserObj.find(n => n.orgid === offer.fromorgid && n.userid === offer.userid)

            var driver = new Driver(offer.userid, parseFloat(orguser.distancefromorg), new Date(offer.date + " " + offer.departuretime),
                Math.round(orguser.timefromorg),
                offer.numberofseats,
                new Date(offer.date + " " + offer.latesttime),
                offer.ridewith,
                offer.smoking,
                offer.fromorgid,
                new Date(offer.date),
                offer.id, parseFloat(offer.tolatitude), parseFloat(offer.tolongitude))

            Drivers.push(driver)
        }
        const requests = await Request.findAll({
            where: {
                status: 'pending'
            }
        }).catch(errHandler);

        if (requests.length > 0) {

            for (request of requests) {

                RequestsArray.push(request.userid)
            }

            const orguserObj = await OrgUser.findAll({
                where: {
                    status: "existing",
                    userid: {
                        [Op.in]: RequestsArray
                    }
                }

            }).catch(errHandler)

            for (request of requests) {
                const orguser = orguserObj.find(n => n.orgid === request.fromorgid && n.userid === request.userid)

                var rider = new Rider(request.userid,
                    parseFloat(orguser.distancefromorg),
                    new Date(request.date + " " + request.departuretime),
                    Math.round(orguser.timefromorg),
                    new Date(request.date + " " + request.latesttime),
                    request.ridewith,
                    request.smoking,
                    request.fromorgid,
                    new Date(request.date),
                    request.id)

                Riders.push(rider);
            }


            var RequestsOffers = RequestsArray.concat(OffersArray)
            const betweenusersObj = await BetweenUsers.findAll({
                where: {
                    user1id: {
                        [Op.in]: RequestsOffers
                    },
                    user2id: {
                        [Op.in]: RequestsOffers
                    }
                }

            }).catch(errHandler)


            if (Drivers.length > 0) {

                for (driver in Drivers) {
                    for (rider in Riders) {
                        if (Riders[rider].fromorgid === Drivers[driver].fromorgid && Riders[rider].ridewith === Drivers[driver].ridewith &&
                            Riders[rider].smoking === Drivers[driver].smoking &&
                            diff_minutes((Drivers[driver].PoolStartTime), (Riders[rider].DepartureTime)) >= 0 &&
                            diff_minutes((Drivers[driver].PoolStartTime), (Riders[rider].DepartureTime)) <= 30
                        ) {
                            const ToDriverFromRider = betweenusersObj.find(n => n.user1id === Riders[rider].userID && n.user2id === Drivers[driver].userID)

                            if (ToDriverFromRider) {

                                var valueDistanceDuration = new values(Riders[rider].ID, Drivers[driver].ID, parseFloat(ToDriverFromRider.distance), Math.round(ToDriverFromRider.time))

                                DRDistanceDurationValue.push(valueDistanceDuration)
                                if (ToDriverFromRider.trust === 1) {
                                    Riders[rider].TrustedDrivers.push(Drivers[driver].ID)
                                } else if (ToDriverFromRider.trust === -1) {
                                    Riders[rider].UnTrustedDrivers.push(Drivers[driver].ID)
                                }
                            }

                        }

                    }

                }
            }

            if (DRDistanceDurationValue.length != 0) {
                if (Riders.length > 0) {
                    for (riderTo in Riders) {
                        for (riderFrom in Riders) {
                            if (Riders[riderFrom].userID !== Riders[riderTo].userID && Riders[riderFrom].toorgid === Riders[riderTo].toorgid && Riders[riderFrom].ridewith === Riders[riderTo].ridewith &&
                                Riders[riderFrom].smoking === Riders[riderTo].smoking &&
                                diff_minutes((Riders[riderFrom].DepartureTime), (Riders[riderTo].DepartureTime)) >= -30 &&
                                diff_minutes((Riders[riderFrom].DepartureTime), (Riders[riderTo].DepartureTime)) <= 30

                            ) {

                                const FromRiderToRider = betweenusersObj.find(n => n.user1id === Riders[riderFrom].userID && n.user2id === Riders[riderTo].userID)

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
                    var diffDropOff

                    for (var j = 0; j < DRDistanceDurationValue.length; j++) {
                        if (DRDistanceDurationValue[j].to === driverID) {
                            var distanceDurationObj = new distanceDuration(DRDistanceDurationValue[j].from, DRDistanceDurationValue[j].to, DRDistanceDurationValue[j].valueDistance, DRDistanceDurationValue[j].valueDuration);
                            Drivers[i].MaxDistanceToNormalize = Math.max(DRDistanceDurationValue[j].valueDistance, Drivers[i].MaxDistanceToNormalize)
                            Drivers[i].MaxDurationToNormalize = Math.max(DRDistanceDurationValue[j].valueDuration, Drivers[i].MaxDurationToNormalize)

                            diffDropOff = diff_minutes(Drivers[i].LatestDropOff, Riders.find(n => n.ID === DRDistanceDurationValue[j].from).LatestDropOff)

                            Drivers[i].MaxDropoffDiffToNormalize = Math.max(diffDropOff, Drivers[i].MaxDropoffDiffToNormalize)
                            DriverRow.push(distanceDurationObj);

                        }

                    }

                    if (Drivers[i].MaxDistanceToNormalize <= 0)
                        Drivers[i].MaxDistanceToNormalize = 1;
                    if (Drivers[i].MaxDurationToNormalize <= 0)
                        Drivers[i].MaxDurationToNormalize = 1;
                    if (Drivers[i].MaxDropoffDiffToNormalize <= 0)
                        Drivers[i].MaxDropoffDiffToNormalize = 1;
                    if (DriverRow.length > 0) {
                        DriversRiders.push(DriverRow);
                    }


                }

                for (var i = 0; i < Riders.length; i++) {
                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);

                    for (var j = 0; j < RRDistanceDurationValue.length; j++) {
                        if (RRDistanceDurationValue[j].to === riderID) {
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
                        if (DRDistanceDurationValue[j].from === RiderID) {
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
                        FromRiderToAllDrivers.push(RiderRow);
                    }

                }



                for (var i = 0; i < Riders.length; i++) {

                    var riderID = Riders[i].ID
                    var RiderRow = new userArray(riderID);
                    for (var j = 0; j < RRDistanceDurationValue.length; j++) {
                        if (RRDistanceDurationValue[j].from === riderID) {
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
                        FromRiderToAllRiders.push(RiderRow);
                    }


                }




                var z = await ReturnTripMatching('./routes/api/ReturnTripMatchingApi');
                var p = await ReturnTripMatchingFare('./routes/api/ReturnTripMatchingApi');

                var OffersToupdate = []
                var RequestsToupdate = []


                for (var i = 0; i < Drivers.length; i++) {
                    if (Drivers[i].AssignedRiders.length > 0) {
                        OffersToupdate.push(Drivers[i].offerid)
                        for (var j = 0; j < Drivers[i].AssignedRiders.length; j++) {
                            RequestsToupdate.push(Drivers[i].AssignedRiders[j])
                        }
                    }
                }

                await Offer.update({ status: "scheduled" }, {
                    where: {
                        id: {
                            [Op.in]: OffersToupdate
                        }
                    }
                }).catch(errHandler)

                await Request.update({ status: "scheduled" }, {
                    where: {
                        id: {
                            [Op.in]: RequestsToupdate
                        }
                    }
                }).catch(errHandler)

                const organizationObj = await Organization.findAll({
                    where: {
                        status: "existing"
                    }
                }).catch(errHandler);

                var TripsArray = []
                var DriversArray = []
                var RidersArray = []
                var countAssigned = 0;
                for (var i = 0; i < Drivers.length; i++) {
                    if (Drivers[i].AssignedRiders.length > 0) {
                        countAssigned++;
                        const organization = organizationObj.find(n => n.id === Drivers[i].fromorgid);
                        var Trip = {}
                        Trip.tofrom = "from"
                        Trip.starttime = 0
                        Trip.endtime = 0
                        Trip.startloclatitude = organization.latitude
                        Trip.startloclongitude = organization.longitude
                        Trip.endloclatitude = Drivers[i].latitude
                        Trip.endloclongitude = Drivers[i].longitude
                        Trip.totaldistance = 0
                        Trip.totaltime = 0
                        Trip.totalfare = 0
                        Trip.numberofseats = Drivers[i].AssignedRiders.length
                        Trip.date = Drivers[i].date
                        Trip.status = "scheduled"

                        TripsArray.push(Trip)

                    }
                }

                const trip = await Trips.bulkCreate(TripsArray).catch(errHandler)

                var tripscounter = 0;
                for (var i = 0; i < Drivers.length; i++) {
                    if (Drivers[i].AssignedRiders.length > 0) {
                        var Driverr = {}
                        Driverr.tripid = trip[tripscounter].dataValues.id
                        Driverr.tofrom = "from"
                        Driverr.offerid = Drivers[i].offerid
                        Driverr.driverid = Drivers[i].userID
                        Driverr.pickuptime = Drivers[i].PoolStartTime
                        Driverr.arrivaltime = Drivers[i].DropOffTime
                        Driverr.actualpickuptime = 0
                        Driverr.actualarrivaltime = 0
                        Driverr.distance = 0
                        Driverr.time = 0
                        Driverr.fare = 0
                        Driverr.expectedfare = 0.8 * Drivers[i].ExpectedFare
                        Driverr.status = "scheduled"

                        DriversArray.push(Driverr)

                        for (var j = 0; j < Drivers[i].AssignedRiders.length; j++) {

                            var Riderr = {}
                            Riderr.tripid = trip[tripscounter].dataValues.id
                            Riderr.tofrom = "from"
                            Riderr.offerid = Drivers[i].offerid
                            Riderr.requestid = Drivers[i].AssignedRiders[j]
                            Riderr.riderid = Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).userID
                            Riderr.pickuptime = Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).DepartureTime
                            Riderr.arrivaltime = Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).DropOffTime
                            Riderr.actualpickuptime = 0
                            Riderr.actualarrivaltime = 0
                            Riderr.distance = 0
                            Riderr.time = 0
                            Riderr.fare = 0
                            Riderr.status = "scheduled"
                            Riderr.expectedfare = Riders.find(n => n.requestid === Drivers[i].AssignedRiders[j]).ExpectedFare
                            RidersArray.push(Riderr)


                        }

                        tripscounter++

                    }
                }

                const RidersCreated = await RiderDB.bulkCreate(RidersArray).catch(errHandler)
                const DriversCreated = await DriverDB.bulkCreate(DriversArray).catch(errHandler)

                if (countAssigned === 0) {

                    res.status(200).send("No trips will be scheduled")
                } else {
                    res.status(200).send("Matching Done")

                }

            } else {
                res.status(200).send("No trips will be scheduled")
            }

        } else {
            res.status(200).send("no requests")
        }

    } else {
        res.status(200).send("no offers")
    }




    Drivers = []
    Riders = []
    DriversRiders = []
    RidersRiders = []
    FromRiderToAllDrivers = []

    FromRiderToAllRiders = []
    DRdistanceValue = []
    DRdurationValue = []
    RRdistanceValue = []
    RRdurationValue = []

});


function getterss() {
    return {
        Riders,
        Drivers,
        RidersRiders,
        DriversRiders,
        FromRiderToAllDrivers,
        FromRiderToAllRiders
    };
}


module.exports = { router, getters: getterss };