const offerRideFrom = require('../../models/offerridefrom');
const offerRideTo = require('../../models/offerrideto');
const requestRideFrom = require('../../models/requestridefrom');
const requestRideTo = require('../../models/requestrideto');
const orgUser = require('../../models/orgusers');
const drivers = require('../../models/drivers');
const riders = require('../../models/riders');
const express = require('express');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
const isToday = (date) => {
    const today = new Date();
    someDate = new Date(date);
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

function validation(carid, numberofseats, fromorgid, date, departuretime, latesttime, ridewith, smoking) {
    var validChecks = true;

    var message;

    //Car id validation
    if (carid == null) {
        message = ({ error: "Car ID", message: "Car ID parameter is missing" });
        validChecks = false
    } else if (((carid).toString()).trim().length === 0) {
        message = ({ error: "Car ID", message: "Car ID can't be empty" });
        validChecks = false
    }
    //Number of seats validation 
    if (numberofseats == null) {
        message = ({ error: "Number of seats", message: "Number of seats parameter is missing" });
        validChecks = false
    } else if (((numberofseats).toString()).trim().length === 0) {
        message = ({ error: "Number of seats", message: "Number of seats can't be empty" });
        validChecks = false
    }
    //Organization id validation 
    else if (fromorgid == null) {
        message = ({ error: "From org id", message: "From org id parameter is missing" });
        validChecks = false
    } else if (((fromorgid).toString()).trim().length === 0) {
        message = ({ error: "From org ID", message: "From org ID can't be empty" });
        validChecks = false
    }
    //Date validation 
    else if (date == null) {
        message = ({ error: "Date", message: "Date parameter is missing" });
        validChecks = false
    } else if (!((typeof(date) === 'string') || ((date) instanceof String))) {
        message = ({ error: "Date", message: "Date must be a string" });
        validChecks = false
    } else if ((date).trim().length === 0) {
        message = ({ error: "Date", message: "Date can't be empty" });
        validChecks = false
    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(date))) {
        message = ({ error: "Date", message: "Date is unvalid" });
        validChecks = false
    }
    //Departure time validation 
    else if (departuretime == null) {
        message = ({ error: "Departute time", message: "Departute time parameter is missing" });
        validChecks = false
    } else if (!((typeof(departuretime) === 'string') || ((departuretime) instanceof String))) {
        message = ({ error: "Departute time", message: "Departute time must be a string" });
        validChecks = false
    } else if ((departuretime).trim().length === 0) {
        message = ({ error: "Departute time", message: "Departute time can't be empty" });
        validChecks = false
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(departuretime))) {
        message = ({ error: "Departute time", message: "Departute time is unvalid" });
        validChecks = false
    } else if ((new Date() - new Date((date.toString()) + " " + (departuretime).toString())) > 0) {
        message = ({ error: "Date and time", message: "The ride can't be in the past" });
        validChecks = false
    }
    //Latest time validation 
    else if (latesttime == null) {
        message = ({ error: "Latest time", message: "Latest time parameter is missing" });
        validChecks = false
    } else if (!((typeof(latesttime) === 'string') || ((latesttime) instanceof String))) {
        message = ({ error: "Latest time", message: "Latest time must be a string" });
        validChecks = false
    } else if ((latesttime).trim().length === 0) {
        message = ({ error: "Latest time", message: "Latest time can't be empty" });
        validChecks = false
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(latesttime))) {
        message = ({ error: "Latest time", message: "Latest time is unvalid" });
        validChecks = false
    } else if (((new Date((date.toString()) + " " + (latesttime).toString())) - (new Date((date.toString()) + " " + (departuretime).toString()))) <= 0) {
        message = ({ error: "Latest time", message: "Latest time can't be before departure time" });
        validChecks = false
    }
    //Ride with validation
    else if (ridewith == null) {
        message = ({ error: "Ride with", message: "Ride with parameter is missing" });
        validChecks = false
    } else if (!((typeof(ridewith) === 'string') || ((ridewith) instanceof String))) {
        message = ({ error: "Ride with", message: "Ride with must be a string" });
        validChecks = false
    } else if ((ridewith).trim().length === 0) {
        message = ({ error: "Ride with", message: "Ride with can't be empty" });
        validChecks = false
    }
    //Smoking validation 
    else if (smoking == null) {
        message = ({ error: "Smoking", message: "Smoking parameter is missing" });
        validChecks = false
    } else if (!((typeof(smoking) === 'string') || ((smoking) instanceof String))) {
        message = ({ error: "Smoking", message: "Smoking must be a string" });
        validChecks = false
    } else if ((smoking).trim().length === 0) {
        message = ({ error: "Smoking", message: "Smoking can't be empty" });
        validChecks = false
    }

    return { validChecks: validChecks, message: message }

}
router.post('/', async(req, res) => {
    var userExists = true;
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }

    await ExpiredToken.findOne({ where: { token: req.headers["authorization"] } }).then(expired => {
        if (expired) {
            userExists = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {
            userExists = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);

    if (userExists) {
        var result = validation(req.body.carid, req.body.numberofseats, req.body.fromorgid, req.body.date, req.body.departuretime, req.body.latesttime, req.body.ridewith, req.body.smoking)
        if (result.validChecks) {
            var error = false;
            var existinorg = true;
            await offerRideFrom.findAll({
                where: {
                    userid: decoded.id,
                    status: {
                        [Op.or]: ["pending", "scheduled", "ongoing"]
                    }
                }
            }).then(rides => {
                rides.forEach(ride => {
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.departuretime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.latesttime).toString());
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
                });
            }).catch(errHandler);
            await offerRideTo.findAll({
                where: {
                    userid: decoded.id,
                    status: {
                        [Op.or]: ["pending", "scheduled", "ongoing"]
                    }
                }
            }).then(rides => {

                rides.forEach(ride => {
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.departuretime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.latesttime).toString());
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
                });
            }).catch(errHandler);
            await requestRideTo.findAll({
                where: {
                    userid: decoded.id,
                    status: {
                        [Op.or]: ["pending", "scheduled", "ongoing"]
                    }
                }
            }).then(rides => {
                rides.forEach(ride => {
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.departuretime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.latesttime).toString());
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
                });
            }).catch(errHandler);
            await requestRideFrom.findAll({
                where: {
                    userid: decoded.id,
                    status: {
                        [Op.or]: ["pending", "scheduled", "ongoing"]
                    }
                }
            }).then(rides => {
                rides.forEach(ride => {
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.departuretime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.latesttime).toString());
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
                });
            }).catch(errHandler);
            const orguser = await orgUser.findOne({
                where: {
                    userid: decoded.id,
                    orgid: req.body.fromorgid,
                    status: "existing"
                }
            }).catch(errHandler)
            if (!orguser) {
                existinorg = false;
            } else {
                existinorg = true;
            }
            const rideData = {
                userid: decoded.id,
                tolatitude: decoded.latitude,
                tolongitude: decoded.longitude,
                fromorgid: parseInt(req.body.fromorgid),
                carid: parseInt(req.body.carid),
                date: req.body.date,
                departuretime: req.body.departuretime,
                ridewith: req.body.ridewith,
                smoking: req.body.smoking,
                latesttime: req.body.latesttime,
                numberofseats: parseInt(req.body.numberofseats),
                status: "pending"
            }
            if (!existinorg) {
                res.status(400).send({ error: "Organization", message: "You aren't assigned to this organization" });
            } else if (error) {
                res.status(400).send({ error: "error", message: "You can't offer two rides at the same time" });
            } else {
                var datee1 = new Date(req.body.date.toString() + " " + req.body.departuretime.toString());
                datee1.setMinutes(datee1.getMinutes() + Math.max(2 * parseFloat(orguser.timefromorg), 30))
                var latestDate = new Date(req.body.date + " " + req.body.latesttime)
                var d3 = new Date(req.body.date + " " + req.body.departuretime);
                d3.setMinutes(d3.getMinutes() + Math.max(parseFloat(orguser.timefromorg), 15))

                if (latestDate < d3 || latestDate > datee1) {
                    res.status(400).send({
                        error: "error",
                        message: "Valid latest drop-off is between:" + d3.getHours() +
                            ":" + d3.getMinutes() + ":" + d3.getSeconds() +
                            " and " + datee1.getHours() +
                            ":" + datee1.getMinutes() + ":" + datee1.getSeconds()
                    });
                } else {
                    await offerRideFrom.create(rideData).then(ride => {
                        res.status(200).send({ message: "Offer is made successfully" });
                    }).catch(errHandler);
                }
            }
        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }
});

module.exports = { router, validation };