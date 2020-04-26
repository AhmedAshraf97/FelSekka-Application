const User = require('../../models/users');
const org = require('../../models/orgusers');
const betweenusers = require('../../models/betweenusers');
betweenusers
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const ExpiredToken = require('../../models/expiredtokens');

function cal(x, y) {

    return x + y
}
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to edit your profile" })
        res.end();
    }
    let isvalid = false
    let loc = false
    var ValidChecks = true;
    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to edit your profile" })
            res.end();
        }
    }).catch(errHandler)

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
                    } else if ((req.body.firstname).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name can't be empty" });
                    } else if (!(/^[a-zA-Z ]*$/.test(req.body.firstname))) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name can only contain letters" });
                    } else if ((req.body.firstname).trim().length > 15) {
                        isvalid = true
                        res.status(400).send({ error: "First name", message: "First name has maximum length of 15 letters" });
                    }
                }
                if (req.body.lastname !== undefined && isvalid === false) {
                    //Last name validation 
                    if (!((typeof(req.body.lastname) === 'string') || ((req.body.lastname) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name must be a string" });
                    } else if ((req.body.lastname).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name can't be empty" });
                    } else if (!(/^[a-zA-Z ]*$/.test(req.body.lastname))) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name can only contain letters" });
                    } else if ((req.body.lastname).trim().length > 15) {
                        isvalid = true
                        res.status(400).send({ error: "Last name", message: "Last name has maximum length of 15 letters" });
                    }
                }

                //Password validation
                if (req.body.oldpassword === undefined && isvalid === false) {

                    if (req.body.newpassword !== undefined || req.body.confirmpassword !== undefined) {
                        isvalid = true
                        res.status(400).send({ error: "Old password ", message: "Old password is missing" });
                    }

                }

                if (req.body.oldpassword !== undefined && isvalid === false) {

                    if (!bcrypt.compareSync(req.body.oldpassword, user.password)) {


                        isvalid = true
                        res.status(400).send({ error: "Old password ", message: "Old password is incorrect" });

                    } else if (req.body.newpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "New password", message: "New password paramter is missing" });
                    } else if (!((typeof(req.body.newpassword) === 'string') || ((req.body.newpassword) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be a string" });
                    } else if ((req.body.newpassword).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password can't be empty" });
                    } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(req.body.newpassword))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" });
                    } else if (req.body.confirmpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "Confirm password", message: "Confirm password paramter is missing" });
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
                    } else if ((req.body.gender).trim().length === 0) {
                        isvalid = true

                        res.status(400).send({ error: "Gender", message: "Gender can't be empty" });
                    }
                }
                if (req.body.birthdate !== undefined && isvalid === false) {
                    //Birthdate validation
                    if (!((typeof(req.body.birthdate) === 'string') || ((req.body.birthdate) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate must be a string" });
                    } else if ((req.body.birthdate).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate can't be empty" });
                    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(req.body.birthdate))) {
                        isvalid = true
                        res.status(400).send({ error: "Birthdate", message: "Birthdate is unvalid" });
                    }
                }
                //Ride with validation
                if (req.body.ridewith !== undefined && isvalid === false) {
                    if (!((typeof(req.body.ridewith) === 'string') || ((req.body.ridewith) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Ride with", message: "Ride with must be a string" });
                    } else if ((req.body.ridewith).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Ride with", message: "Ride with can't be empty" });
                    }
                }
                if (req.body.smoking !== undefined && isvalid === false) {
                    if (!((typeof(req.body.smoking) === 'string') || ((req.body.smoking) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Smoking", message: "Smoking must be a string" });
                    } else if ((req.body.smoking).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Smoking", message: "Smoking can't be empty" });
                    }
                    //Latitude validation
                }
                if (req.body.latitude !== undefined && isvalid === false) {
                    loc = true
                    if (((req.body.latitude).toString()).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
                    } else if ((typeof(req.body.latitude) === 'string') || ((req.body.latitude) instanceof String)) {
                        isvalid = true
                        res.status(400).send({ error: "Latitude", message: "Latitude must be a decimal" });
                    }
                }

                if (req.body.longitude !== undefined && isvalid === false) {
                    loc = true
                    if (((req.body.longitude).toString()).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
                    } else if ((typeof(req.body.longitude) === 'string') || ((req.body.longitude) instanceof String)) {
                        isvalid = true
                        res.status(400).send({ error: "Longitude", message: "Longitude must be a decimal" });
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



                    user.update({
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
                    }).then(user1 => {
                        if (loc === true) {
                            console.log("hi")
                            org.update({
                                distancetoorg: cal(2, req.body.longitude),
                                timetoorg: 0,
                                distancefromorg: 0,
                                timefromorg: 0
                            }, {
                                where: {
                                    userid: decoded.id,
                                    status: "existing"

                                }
                            }).then(betweenuser1 => {
                                betweenusers.update({
                                    distance: cal(3, req.body.longitude),
                                    time: 0
                                }, {
                                    where: {
                                        user1id: decoded.id

                                    }
                                })
                            }).then(betweenuser2 => {
                                    betweenusers.update({
                                        distance: cal(4, req.body.longitude),
                                        time: 0
                                    }, {
                                        where: {
                                            user2id: decoded.id

                                        }
                                    }).then(res.status(200).send("OK")).catch(errHandler);
                                }

                            ).catch(errHandler);
                        }

                    }).catch(errHandler);
                    // distancetoorg timetoorg distancefromorg timefromorg 
                    //.then(res.status(200).send("OK")).catch(errHandler);



                }

            } else
                res.status(401).send("User doesn't exist, Please Enter valid ID")
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})
module.exports = router;