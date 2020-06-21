const User = require('../../models/users');
const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const express = require('express');
const router = express.Router();

const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
var request = require('request-promise');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret'
const { forEach } = require('p-iteration');
const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(firstname, lastname, username, email,
    phonenumber, password, confirmpassword, gender, birthdate, ridewith, smoking, longitude, latitude) {
    var validChecks = true;
    var message;

    if (firstname == null) {
        message = ({ error: "First name", message: "First name parameter is missing" });
        validChecks = false;
    } else if (!((typeof(firstname) === 'string') || ((firstname) instanceof String))) {
        message = ({ error: "First name", message: "First name must be a string" });
        validChecks = false;
    } else if ((firstname).trim().length === 0) {
        message = ({ error: "First name", message: "First name can't be empty" });
        validChecks = false;
    } else if (!(/^[a-zA-Z ]*$/.test(firstname))) {
        message = ({ error: "First name", message: "First name can only contain letters" });
        validChecks = false;
    } else if ((firstname).trim().length > 15) {
        message = ({ error: "First name", message: "First name has maximum length of 15 letters" });
        validChecks = false;
    }
    //Last name validation 
    else if (lastname == null) {
        message = ({ error: "Last name", message: "Last name parameter is missing" });
        validChecks = false;
    } else if (!((typeof(lastname) === 'string') || ((lastname) instanceof String))) {
        message = ({ error: "Last name", message: "Last name must be a string" });
        validChecks = false;
    } else if ((lastname).trim().length === 0) {
        message = ({ error: "Last name", message: "Last name can't be empty" });
        validChecks = false;
    } else if (!(/^[a-zA-Z ]*$/.test(lastname))) {
        message = ({ error: "Last name", message: "Last name can only contain letters" });
        validChecks = false;
    } else if ((lastname).trim().length > 15) {
        message = ({ error: "Last name", message: "Last name has maximum length of 15 letters" });
        validChecks = false;
    }
    //Username validation
    else if (username == null) {
        message = ({ error: "Username", message: "Username parameter is missing" });
        validChecks = false;
    } else if (!(/^[A-Za-z][A-Za-z0-9]*([_A-Za-z0-9]+)*$/.test(username))) {
        message = ({ error: "Username", message: "Username must be a string" });
        validChecks = false;
    }
    //  else if (!((typeof(username) === 'string') || ((username) instanceof String))) {
    //     message = ({ error: "Username", message: "Username must be a string" });
    //     validChecks = false;
    // }
    else if ((username).trim().length === 0) {
        message = ({ error: "Username", message: "Username can't be empty" });
        validChecks = false;
    } else if (!(/^\S+$/.test(username))) {
        message = ({ error: "Username", message: "Username can't contain spaces" });
        validChecks = false;
    } else if ((username).trim().length > 20) {
        message = ({ error: "Username", message: "Username has maximum length of 20 characters" });
        validChecks = false;
    }
    //Email validation
    else if (email == null) {
        message = ({ error: "Email", message: "Email parameter is missing" });
        validChecks = false;
    } else if (!((typeof(email) === 'string') || ((email) instanceof String))) {
        message = ({ error: "Email", message: "Email must be a string" });
        validChecks = false;
    } else if ((email).trim().length === 0) {
        message = ({ error: "Email", message: "Email can't be empty" });
        validChecks = false;
    } else if (!(/^\S+@\S+\.\S+$/.test(email))) {
        message = ({ error: "Email", message: "Email address is unvalid" });
        validChecks = false;
    }
    //Phone number validation
    else if (phonenumber == null) {
        message = ({ error: "Phone number", message: "Phone number parameter is missing" });
        validChecks = false;
    } else if (!((typeof(phonenumber) === 'string') || ((phonenumber) instanceof String))) {
        message = ({ error: "Phone number", message: "Phone number must be a string" });
        validChecks = false;
    } else if ((phonenumber).trim().length === 0) {
        message = ({ error: "Phone number", message: "Phone number can't be empty" });
        validChecks = false;
    } else if (!(/^[0-9]{11}$/.test(phonenumber))) {
        message = ({ error: "Phone number", message: "Phone number is unvalid" });
        validChecks = false;
    }
    //Password validation
    else if (password == null) {
        message = ({ error: "Password", message: "Password parameter is missing" });
        validChecks = false;
    } else if (!((typeof(password) === 'string') || ((password) instanceof String))) {
        message = ({ error: "Password", message: "Password must be a string" });
        validChecks = false;
    } else if ((password).trim().length === 0) {
        message = ({ error: "Password", message: "Password can't be empty" });
        validChecks = false;
    } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(password))) {
        message = ({ error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" });
        validChecks = false;
    }
    //Confirm password validation
    else if (confirmpassword == null) {
        message = ({ error: "Confirm password", message: "Confirm password parameter is missing" });
        validChecks = false;
    } else if (!((typeof(confirmpassword) === 'string') || ((confirmpassword) instanceof String))) {
        message = ({ error: "Confirm password", message: "Confirm password must be a string" });
        validChecks = false;
    } else if ((confirmpassword).trim().length === 0) {
        message = ({ error: "Confirm password", message: "Password can't be empty" });
        validChecks = false;
    } else if (!(password === confirmpassword)) {
        message = ({ error: "Confirm password ", message: "Passwords don't match" });
        validChecks = false;
    }
    //Gender validation
    else if (gender == null) {
        message = ({ error: "Gender", message: "Gender parameter is missing" });
        validChecks = false;
    } else if (!((typeof(gender) === 'string') || ((gender) instanceof String))) {
        message = ({ error: "Gender", message: "Gender must be a string" });
        validChecks = false;
    } else if ((gender).trim().length === 0) {
        message = ({ error: "Gender", message: "Gender can't be empty" });
        validChecks = false;
    }
    //Birthdate validation
    else if (birthdate == null) {
        message = ({ error: "Birthdate", message: "Birthdate parameter is missing" });
        validChecks = false;
    } else if (!((typeof(birthdate) === 'string') || ((birthdate) instanceof String))) {
        message = ({ error: "Birthdate", message: "Birthdate must be a string" });
        validChecks = false;
    } else if ((birthdate).trim().length === 0) {
        message = ({ error: "Birthdate", message: "Birthdate can't be empty" });
        validChecks = false;
    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(birthdate))) {
        message = ({ error: "Birthdate", message: "Birthdate is unvalid" });
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
    //Latitude validation
    else if (latitude == null) {
        message = ({ error: "Latitude", message: "Latitude parameter is missing" });
        validChecks = false;
    } else if (((latitude).toString()).trim().length === 0) {
        message = ({ error: "Latitude", message: "Latitude can't be empty" });
        validChecks = false;
    }
    //Longitude validation
    else if (longitude == null) {
        message = ({ error: "Longitude", message: "Longitude parameter is missing" });
        validChecks = false;
    } else if (((longitude).toString()).trim().length === 0) {
        message = ({ error: "Longitude", message: "Longitude can't be empty" });
        validChecks = false;
    }

    return { validChecks: validChecks, message: message }

}

//SignUp (na2es verification by email)
router.post('/', async(req, res) => {
    //Object added to database
    const userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        password: bcrypt.hashSync(req.body.password, 10),
        gender: req.body.gender,
        birthdate: req.body.birthdate,
        ridewith: req.body.ridewith,
        smoking: req.body.smoking,
        longitude: parseFloat(req.body.longitude),
        latitude: parseFloat(req.body.latitude),
        rating: 5.0,
        status: "existing",
        photo: req.body.photo,
    }
    let usernameExists = 0;
    let emailExists = 0;
    let phonenumberExists = 0;
    //Check wether username already exists
    if (req.body.username != null) {
        await User.findOne({ where: { username: req.body.username, status: "existing" } }).then(user => {
            if (user) {
                usernameExists = 1;
            }
        }).catch(errHandler);
    }
    //Check wether email already exists
    if (req.body.email != null) {
        await User.findOne({ where: { email: req.body.email, status: "existing" } }).then(user => {
            if (user) {
                emailExists = 1;
            }
        }).catch(errHandler);
    }
    //Check wether phone number already exists
    if (req.body.phonenumber != null) {
        await User.findOne({ where: { phonenumber: req.body.phonenumber, status: "existing" } }).then(user => {
            if (user) {
                phonenumberExists = 1;
            }
        }).catch(errHandler);
    }
    if (usernameExists === 1) {
        res.status(400).send({ error: "Username", message: "This username already exists" });
    } else if (emailExists === 1) {
        res.status(400).send({ error: "Email", message: "This email already exists" });
    } else if (phonenumberExists === 1) {
        res.status(400).send({ error: "Phone number", message: "This phone number already exists" });

    } else {
        var result = validation(req.body.firstname, req.body.lastname, req.body.username, req.body.email,
            req.body.phonenumber, req.body.password, req.body.confirmpassword, req.body.gender, req.body.birthdate,
            req.body.ridewith, req.body.smoking, req.body.longitude, req.body.latitude)
        if (result.validChecks) {
            var createdUserID = 0;
            var distance12 = 0;
            var distance21 = 0;
            var time12 = 0;
            var time21 = 0;

            //Insert user 
            const userCreate = await User.create(userData).catch(errHandler)
            if (userCreate) {
                createdUserID = userCreate.id;
                res.status(200).send({ message: "User is created" });
            }

            //Insert users in betweenusers
            const allUsers = await User.findAll({
                where: {
                    [Op.and]: [{
                            id: {
                                [Op.ne]: createdUserID
                            }
                        },
                        { status: 'existing' }
                    ]
                }
            }).catch(errHandler);

            var BetweenUsersArray = []

            for (user of allUsers) {
                var x = req.body.latitude;
                var y = req.body.longitude;
                var z = user.latitude;
                var w = user.longitude;
                var body12 = {}
                var body21 = {}
                var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z, ',', w, '&destinations=', x, ',', y, '&key=', API_KEY);
                var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x, ',', y, '&destinations=', z, ',', w, '&key=', API_KEY);
                const url122 = await request.post(url12).catch(errHandler)
                body12 = url122;

                const url211 = await request.post(url21).catch(errHandler)
                body21 = url211;

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
                const betweenUsersData1 = {
                    user1id: user.id,
                    user2id: createdUserID,
                    distance: distance12,
                    time: time12,
                    trust: 0
                }
                const betweenUsersData2 = {
                    user1id: createdUserID,
                    user2id: user.id,
                    distance: distance21,
                    time: time21,
                    trust: 0
                }
                BetweenUsersArray.push(betweenUsersData1)

                BetweenUsersArray.push(betweenUsersData2)

            }
            await BetweenUsers.bulkCreate(BetweenUsersArray).catch(errHandler);

        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }

});

module.exports = { router, validation };