const User = require('../../models/users');
const orgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const ExpiredToken = require('../../models/expiredtokens');

const Organization = require('../../models/organizations');

const Op = Sequelize.Op;
var request = require('request-promise');
const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";

let loc = false
function validation(firstname, lastname, oldpassword, useroldpassword, newpassword,
    confirmpassword, gender, birthdate, ridewith, smoking, latitude, longitude) {
    var validChecks = true;
    var message = ""
    if (firstname !== "") {

        if (!((typeof(firstname) === 'string') || ((firstname) instanceof String))) {
            validChecks = false
            message = { error: "First name", message: "First name must be a string" }
        } else if ((firstname).trim().length === 0) {
            validChecks = false
            message = { error: "First name", message: "First name can't be empty" }
        } else if (!(/^[a-zA-Z ]*$/.test(firstname))) {
            validChecks = false
            message = { error: "First name", message: "First name can only contain letters" }
        } else if ((firstname).trim().length > 15) {
            validChecks = false
            message = { error: "First name", message: "First name has maximum length of 15 letters" }
        }
    }
    if (lastname !== "" && validChecks === true) {
        if (!((typeof(lastname) === 'string') || ((lastname) instanceof String))) {
            validChecks = false
            message = { error: "Last name", message: "Last name must be a string" }
        } else if ((lastname).trim().length === 0) {
            validChecks = false
            message = { error: "Last name", message: "Last name can't be empty" }
        } else if (!(/^[a-zA-Z ]*$/.test(lastname))) {
            validChecks = false
            message = { error: "Last name", message: "Last name can only contain letters" }
        } else if ((lastname).trim().length > 15) {
            validChecks = false
            message = { error: "Last name", message: "Last name has maximum length of 15 letters" }
        }
    }

    if (oldpassword === "" && validChecks === true) {

        if (newpassword !== "" || confirmpassword !== "") {
            validChecks = false
            message = { error: "Old password ", message: "Old password is missing" }
        }

    }

    if (oldpassword !== "" && validChecks === true) {

        if (!bcrypt.compareSync(oldpassword, useroldpassword)) {


            validChecks = false
            message = { error: "Old password ", message: "Old password is incorrect" }

        } else if (newpassword == "") {
            validChecks = false
            message = { error: "New password", message: "New password parameter is missing" }
        } else if (!((typeof(newpassword) === 'string') || ((newpassword) instanceof String))) {
            validChecks = false
            message = { error: "Password", message: "Password must be a string" }
        } else if ((newpassword).trim().length === 0) {
            validChecks = false
            message = { error: "Password", message: "Password can't be empty" }
        } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(newpassword))) {
            validChecks = false
            message = { error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" }
        } else if (confirmpassword == "") {
            validChecks = false
            message = { error: "Confirm password", message: "Confirm password parameter is missing" }
        } else if ((confirmpassword).trim().length === 0) {
            validChecks = false
            message = { error: "Confirm password", message: "Password can't be empty" }
        } else if (!(newpassword === confirmpassword)) {
            validChecks = false
            message = { error: "Confirm password ", message: "Passwords don't match" }
        }
    }
    //Gender validation
    if (gender !== "" && validChecks === true) {
        if (!((typeof(gender) === 'string') || ((gender) instanceof String))) {
            validChecks = false
            message = { error: "Gender", message: "Gender must be a string" }
        } else if ((gender).trim().length === 0) {
            validChecks = false
            message = { error: "Gender", message: "Gender can't be empty" }
        }
    }
    if (birthdate !== "" && validChecks === true) {
        //Birthdate validation
        if (!((typeof(birthdate) === 'string') || ((birthdate) instanceof String))) {
            validChecks = false
            message = { error: "Birthdate", message: "Birthdate must be a string" }
        } else if ((birthdate).trim().length === 0) {
            validChecks = false
            message = { error: "Birthdate", message: "Birthdate can't be empty" }
        } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(birthdate))) {
            validChecks = false
            message = { error: "Birthdate", message: "Birthdate is unvalid" }
        }
    }
    //Ride with validation
    if (ridewith !== "" && validChecks === true) {
        if (!((typeof(ridewith) === 'string') || ((ridewith) instanceof String))) {
            validChecks = false
            message = { error: "Ride with", message: "Ride with must be a string" }
        } else if ((ridewith).trim().length === 0) {
            validChecks = false
            message = { error: "Ride with", message: "Ride with can't be empty" }
        }
    }
    if (smoking !== "" && validChecks === true) {
        if (!((typeof(smoking) === 'string') || ((smoking) instanceof String))) {
            validChecks = false
            message = { error: "Smoking", message: "Smoking must be a string" }
        } else if ((smoking).trim().length === 0) {
            validChecks = false
            message = { error: "Smoking", message: "Smoking can't be empty" }
        }
        //Latitude validation
    }
    if (latitude !== "" && validChecks === true) {
        loc = true
        if (((latitude).toString()).trim().length === 0) {
            validChecks = false
            message = { error: "Latitude", message: "Latitude can't be empty" }
        }
    }

    if (longitude !== "" && validChecks === true) {
        loc = true
        if (((longitude).toString()).trim().length === 0) {
            validChecks = false
            message = { error: "Longitude", message: "Longitude can't be empty" }
        }
    }

    return { validChecks: validChecks, message: message }
}

const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    let isvalid = false
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        isvalid = true;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }

   

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            isvalid = true;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    if (!isvalid) {
        await User.findOne({
            where: {
                id: decoded.id,
                "status": "existing"
            }
        }).then(user => {
            if (user) {
                var result = validation(req.body.firstname, req.body.lastname, req.body.oldpassword, user.password, req.body.newpassword,
                    req.body.confirmpassword, req.body.gender, req.body.birthdate,
                    req.body.ridewith, req.body.smoking, req.body.latitude, req.body.longitude)

                if (result.validChecks === true) {
                    let bcryptPass
                    if (req.body.newpassword !== "") {
                        bcryptPass = bcrypt.hashSync(req.body.newpassword, 10)
                    } else {
                        bcryptPass = user.password
                    }
                    User.update({
                        firstname: req.body.firstname || user.firstname,
                        lastname: req.body.lastname || user.lastname,
                        password: bcryptPass,
                        gender: req.body.gender || user.gender,
                        birthdate: req.body.birthdate || user.birthdate,
                        ridewith: req.body.ridewith || user.ridewith,
                        smoking: req.body.smoking || user.smoking,
                        latitude: parseFloat(req.body.latitude) || user.latitude,
                        longitude: parseFloat(req.body.longitude) || user.longitude
                    }, {
                        where: { id: decoded.id }
                    }).then(
                        res.status(200).send({  message: "OK" }) 
                    ).catch(errHandler);
                } else {
                    res.status(400).send(result.message)
                    res.end();
                }
            } else {
                res.status(401).send({ error: "User not found", message: "User not found" })
            }
        }).catch(err => { res.send('error: ' + err) })

        if (isvalid === false && loc === true) {

            const allUsers = await User.findAll({
                where: {
                    [Op.and]: [{
                        id: {
                            [Op.ne]: decoded.id
                        }
                    }, { status: 'existing' }]
                }
            }).catch(errHandler);

            for(user of allUsers) {
                var x = req.body.latitude.toString();
                var y = req.body.longitude.toString();
                var z = user.latitude;
                var w = user.longitude;
                var body12 = {}
                var body21 = {}
                var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z, ',', w, '&destinations=', x, ',', y, '&key=', API_KEY);
                var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x, ',', y, '&destinations=', z, ',', w, '&key=', API_KEY);
                await request.post(url12).then(function(body) {
                    body12 = body;
                })
                await request.post(url21).then(function(body) {
                    body21 = body;
                })
                body12 = JSON.parse(body12)
                body21 = JSON.parse(body21)
                var results12 = body12.rows[0].elements;
                var element12 = results12[0]
                distance12 = element12.distance.value / 1000;
                time12 = element12.duration.value / 60;
                ///////////////////////////////////
                var results21 = body21.rows[0].elements;
                var element21 = results21[0]
                distance21 = element21.distance.value / 1000;
                time21 = element21.duration.value / 60;

                await BetweenUsers.update({
                    distance: distance12,
                    time: time12
                }, {
                    where: { user1id: user.id, user2id: decoded.id }
                }).catch(errHandler);

                await BetweenUsers.update({
                    distance: distance21,
                    time: time21
                }, {
                    where: { user1id: decoded.id, user2id: user.id }
                }).catch(errHandler);
            }


            const orgUsers = await orgUser.findAll({
                where: {
                    [Op.and]: [{ userid: decoded.id }, { status: 'existing' }]
                }
            }).catch(errHandler);


           for (user of orgUsers) {

                await Organization.findOne({ where: { id: user.orgid, status: 'existing' } }).then(org => {
                    orglatitude = org.latitude;
                    orglongitude = org.longitude;
                    orgid = org.id;
                }).catch(errHandler);

                var x = orglatitude;
                var y = orglongitude;
                var z = req.body.latitude.toString();
                var w = req.body.longitude.toString();
                var orgid = orgid;
                var body12 = {}
                var body21 = {}
                var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z, ',', w, '&destinations=', x, ',', y, '&key=', API_KEY);
                var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x, ',', y, '&destinations=', z, ',', w, '&key=', API_KEY);
                await request.post(url12).then(function(body) {
                    body12 = body;
                })
                await request.post(url21).then(function(body) {
                    body21 = body;
                })
                body12 = JSON.parse(body12)
                body21 = JSON.parse(body21)
                var results12 = body12.rows[0].elements;
                var element12 = results12[0]
                distance12 = element12.distance.value / 1000;
                time12 = element12.duration.value / 60;
                ///////////////////////////////////
                var results21 = body21.rows[0].elements;
                var element21 = results21[0]
                distance21 = element21.distance.value / 1000;
                time21 = element21.duration.value / 60;
                await orgUser.update({
                    distancetoorg: distance12,
                    timetoorg: time12,
                    distancefromorg: distance21,
                    timefromorg: time21,
                }, {
                    where: { userid: decoded.id, orgid: orgid, status: 'existing' }
                }).catch(errHandler);
            }
        }
    }
})
module.exports = { router, validation };