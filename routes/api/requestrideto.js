const offerRideFrom = require('../../models/offerridefrom');
const offerRideTo = require('../../models/offerrideto');
const requestRideFrom = require('../../models/requestridefrom');
const requestRideTo = require('../../models/requestrideto');
const orgUser = require('../../models/orgusers');
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
const func = require('joi/lib/types/func');
const { min } = require('joi/lib/types/object');
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

function validation(toorgid, date, earliesttime, arrivaltime, ridewith, smoking) {
    var validChecks = true;
    var message;

    //Organization id validation
    if (toorgid == null) {
        message = ({ error: "From org id", message: "From org id parameter is missing" });
        validChecks = false;
    }
    //Date validation
    else if (date == null) {
        message = ({ error: "Date", message: "Date parameter is missing" });
        validChecks = false;
    } else if (!((typeof(date) === 'string') || ((date) instanceof String))) {
        message = ({ error: "Date", message: "Date must be a string" });
        validChecks = false;
    } else if ((date).trim().length === 0) {
        message = ({ error: "Date", message: "Date can't be empty" });
        validChecks = false;
    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(date))) {
        message = ({ error: "Date", message: "Date is unvalid" });
        validChecks = false;
    }
    //Earliest time 
    else if (earliesttime == null) {
        message = ({ error: "Earliest time", message: "Earliest time parameter is missing" });
        validChecks = false;
    } else if (!((typeof(earliesttime) === 'string') || ((earliesttime) instanceof String))) {
        message = ({ error: "Earliest time", message: "Earliest time must be a string" });
        validChecks = false;
    } else if ((earliesttime).trim().length === 0) {
        message = ({ error: "Earliest time", message: "Earliest time can't be empty" });
        validChecks = false;
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(earliesttime))) {
        message = ({ error: "Earliest time", message: "Earliest time is unvalid" });
        validChecks = false;
    } else if ((new Date() - new Date((date.toString()) + " " + (earliesttime).toString())) > 0) {
        message = ({ error: "Date and time", message: "The ride can't be in the past" });
        validChecks = false;
    }
    //Arrival time validation
    else if (arrivaltime == null) {
        message = ({ error: "Arrival time", message: "Arrival time parameter is missing" });
        validChecks = false;
    } else if (!((typeof(arrivaltime) === 'string') || ((arrivaltime) instanceof String))) {
        message = ({ error: "Arrival time", message: "Arrival time must be a string" });
        validChecks = false;
    } else if ((arrivaltime).trim().length === 0) {
        message = ({ error: "Arrival time", message: "Arrival time can't be empty" });
        validChecks = false;
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(arrivaltime))) {
        message = ({ error: "Arrival time", message: "Arrival time is unvalid" });
        validChecks = false;
    } else if (((new Date((date.toString()) + " " + (arrivaltime).toString())) - (new Date((date.toString()) + " " + (earliesttime).toString()))) <= 0) {
        message = ({ error: "Arrival time", message: "Arrival time can't be before earliest time" });
        validChecks = false;
    }
    //Ride with validation
    else if (ridewith == null) {
        message = ({ error: "Ride with", message: "Ride with parameter is missing" });
        validChecks = false;
    } else if (!((typeof(ridewith) === 'string') || ((ridewith) instanceof String))) {
        message = ({ error: "Ride with", message: "Ride with must be a string" });
        validChecks = false;
    } else if ((ridewith).trim().length === 0) {
        message = ({ error: "Ride with", message: "Ride with can't be empty" });
        validChecks = false;
    }
    //Smoking validation
    else if (smoking == null) {
        message = ({ error: "Smoking", message: "Smoking parameter is missing" });
        validChecks = false;
    } else if (!((typeof(smoking) === 'string') || ((smoking) instanceof String))) {
        message = ({ error: "Smoking", message: "Smoking must be a string" });
        validChecks = false;
    } else if ((smoking).trim().length === 0) {
        message = ({ error: "Smoking", message: "Smoking can't be empty" });
        validChecks = false;
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
            res.status(401).send({ message: "You aren't authorized " })
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

        var result = validation(req.body.toorgid, req.body.date, req.body.earliesttime, req.body.arrivaltime, req.body.ridewith, req.body.smoking)

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
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
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
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
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
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
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
                    var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                    var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
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
                    orgid: req.body.toorgid,
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
                fromlatitude: decoded.latitude,
                fromlongitude: decoded.longitude,
                toorgid: parseInt(req.body.toorgid),
                date: req.body.date,
                arrivaltime: req.body.arrivaltime,
                ridewith: req.body.ridewith,
                smoking: req.body.smoking,
                earliesttime: req.body.earliesttime,
                status: "pending"
            }
            if (!existinorg) {
                res.status(400).send({ error: "Organization", message: "You aren't assigned to this organization" });
            } else if (error) {
                res.status(400).send({ error: "error", message: "You can't request two rides at the same time" });
            } else {
                var datee1 = new Date(req.body.date.toString() + " " + req.body.arrivaltime.toString());
                datee1.setMinutes(datee1.getMinutes() - Math.max(parseFloat(2 * orguser.timetoorg), 30))
                var EarliestDate = new Date(req.body.date + " " + req.body.earliesttime)
                var d3 = new Date(req.body.date + " " + req.body.arrivaltime);
                d3.setMinutes(d3.getMinutes() - Math.max(parseFloat(orguser.timetoorg), 15))

                if (EarliestDate < datee1 || EarliestDate > d3) {
                    res.status(400).send({
                        error: "error",
                        message: "Valid Earliest pick-up time is between:" + datee1.getHours() +
                            ":" + datee1.getMinutes() + ":" + datee1.getSeconds() +
                            " and " + d3.getHours() +
                            ":" + d3.getMinutes() + ":" + d3.getSeconds()
                    });
                } else {
                    await requestRideTo.create(rideData).then(ride => {
                        res.status(200).send({ message: "Request is made successfully" });
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