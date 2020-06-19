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

function cal(x, y) {

    return x + y
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

    let loc = false

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

                if (req.body.firstname !== undefined) {

                    if (!((typeof(req.body.firstname) === 'string') || ((req.body.firstname) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name must be a string" });
                        res.end()
                    } else if ((req.body.firstname).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name can't be empty" });
                        res.end()
                    } else if (!(/^[a-zA-Z ]*$/.test(req.body.firstname))) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name can only contain letters" });
                        res.end()
                    } else if ((req.body.firstname).trim().length > 15) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name has maximum length of 15 letters" });
                        res.end()
                    }
                }
                if (req.body.lastname !== undefined && isvalid === false) {
                    //Last name validation 
                    if (!((typeof(req.body.lastname) === 'string') || ((req.body.lastname) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name must be a string" });
                        res.end()
                    } else if ((req.body.lastname).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name can't be empty" });
                        res.end()
                    } else if (!(/^[a-zA-Z ]*$/.test(req.body.lastname))) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name can only contain letters" });
                        res.end()
                    } else if ((req.body.lastname).trim().length > 15) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name has maximum length of 15 letters" });
                        res.end()
                    }
                }

                //Password validation
                if (req.body.oldpassword === undefined && isvalid === false) {

                    if (req.body.newpassword !== undefined || req.body.confirmpassword !== undefined) {
                        isvalid = true
                        res.status(400).send({ error: "Old password ", message: "Old password is missing" });
                        res.end()
                    }

                }

                if (req.body.oldpassword !== undefined && isvalid === false) {

                    if (!bcrypt.compareSync(req.body.oldpassword, user.password)) {


                        isvalid = true
                        res.status(400).send({ error: "Old password ", message: "Old password is incorrect" });
                        res.end()

                    } else if (req.body.newpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "New password", message: "New password paramter is missing" });
                        res.end()
                    } else if (!((typeof(req.body.newpassword) === 'string') || ((req.body.newpassword) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be a string" });
                        res.end()
                    } else if ((req.body.newpassword).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password can't be empty" });
                        res.end()
                    } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(req.body.newpassword))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" });
                        res.end()
                    } else if (req.body.confirmpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "Confirm password", message: "Confirm password paramter is missing" });
                        res.end()
                    }


                    //Confirm password validation
                    else if ((req.body.confirmpassword).trim().length === 0) { /////////askk, string
                        isvalid = true
                        res.status(400).send({ error: "Confirm password", message: "Password can't be empty" });
                    } else if (!(req.body.newpassword === req.body.confirmpassword)) {
                        isvalid = true
                        res.status(400).send({ error: "Confirm password ", message: "Passwords don't match" });
                    }
                }
                //Gender validation
                if (req.body.gender !== undefined && isvalid === false) {
                    if (!((typeof(req.body.gender) === 'string') || ((req.body.gender) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Gender", message: "Gender must be a string" });
                        res.end()
                    } else if ((req.body.gender).trim().length === 0) {
                        isvalid = true

                        res.status(400).send({ error: "Gender", message: "Gender can't be empty" });
                        res.end()
                    }
                }
                if (req.body.birthdate !== undefined && isvalid === false) {
                    //Birthdate validation
                    if (!((typeof(req.body.birthdate) === 'string') || ((req.body.birthdate) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate must be a string" });
                        res.end()
                    } else if ((req.body.birthdate).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate can't be empty" });
                        res.end()
                    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(req.body.birthdate))) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate is unvalid" });
                        res.end()
                    }
                }
                //Ride with validation
                if (req.body.ridewith !== undefined && isvalid === false) {
                    if (!((typeof(req.body.ridewith) === 'string') || ((req.body.ridewith) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Ride with", message: "Ride with must be a string" });
                        res.end()
                    } else if ((req.body.ridewith).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Ride with", message: "Ride with can't be empty" });
                        res.end()
                    }
                }
                if (req.body.smoking !== undefined && isvalid === false) {
                    if (!((typeof(req.body.smoking) === 'string') || ((req.body.smoking) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Smoking", message: "Smoking must be a string" });
                        res.end()
                    } else if ((req.body.smoking).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Smoking", message: "Smoking can't be empty" });
                        res.end()
                    }
                    //Latitude validation
                }
                if (req.body.latitude !== undefined && isvalid === false) {
                    loc = true
                    if (((req.body.latitude).toString()).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
                        res.end()
                    } else if ((typeof(req.body.latitude) === 'string') || ((req.body.latitude) instanceof String)) {
                        isvalid = true
                        res.status(400).send({ error: "Latitude", message: "Latitude must be a decimal" });
                        res.end()
                    }
                }

                if (req.body.longitude !== undefined && isvalid === false) {
                    loc = true
                    if (((req.body.longitude).toString()).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
                        res.end()
                    } else if ((typeof(req.body.longitude) === 'string') || ((req.body.longitude) instanceof String)) {
                        isvalid = true
                        res.status(400).send({ error: "Longitude", message: "Longitude must be a decimal" });
                        res.end()
                    }
                }
                let bcryptPass
                if (req.body.newpassword !== undefined) {
                    bcryptPass = bcrypt.hashSync(req.body.newpassword, 10)
                } else {
                    bcryptPass = user.password
                }
                /////check if all paramters empty dont update
                if (isvalid === false) {
                    User.update({
                        firstname: req.body.firstname || user.firstname,
                        lastname: req.body.lastname || user.lastname,
                        password: bcryptPass,
                        gender: req.body.gender || user.gender,
                        birthdate: req.body.birthdate || user.birthdate,
                        ridewith: req.body.ridewith || user.ridewith,
                        smoking: req.body.smoking || user.smoking,
                        latitude: req.body.latitude || user.latitude,
                        longitude: req.body.longitude || user.longitude
                    }, {
                        where: { id: decoded.id }
                    }).then(
                        res.status(200).send({ message: "OK" })).catch(errHandler);
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

            allUsers.forEach(async(user) => {
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
            });


            const orgUsers = await orgUser.findAll({
                where: {
                    [Op.and]: [{ userid: decoded.id }, { status: 'existing' }]
                }
            }).catch(errHandler);


            orgUsers.forEach(async(user) => {

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
            })
        }
    }
})
module.exports = router;