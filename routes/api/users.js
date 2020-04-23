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
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret'

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
//SignUp (na2es verification by email)
router.post('/signup', async(req, res) => {
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
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        rating: 5.0,
        status: "existing",
        photo: req.body.photo,
    }
    let usernameExists = 0;
    let emailExists = 0;
    let phonenumberExists = 0;
    //Check wether username already exists
    if (req.body.username != null) {
        await User.findOne({ where: { username: req.body.username } }).then(user => {
            if (user) {
                usernameExists = 1;
            }
        }).catch(errHandler);
    }
    //Check wether email already exists
    if (req.body.email != null) {
        await User.findOne({ where: { email: req.body.email } }).then(user => {
            if (user) {
                emailExists = 1;
            }
        }).catch(errHandler);
    }
    //Check wether phone number already exists
    if (req.body.phonenumber != null) {
        await User.findOne({ where: { phonenumber: req.body.phonenumber } }).then(user => {
            if (user) {
                phonenumberExists = 1;
            }
        }).catch(errHandler);
    }
    // First name validation 
    if (req.body.firstname == null) {
        res.status(400).send({ error: "First name", message: "First name paramter is missing" });
    } else if (!((typeof(req.body.firstname) === 'string') || ((req.body.firstname) instanceof String))) {
        res.status(400).send({ error: "First name", message: "First name must be a string" });
    } else if ((req.body.firstname).trim().length === 0) {
        res.status(400).send({ error: "First name", message: "First name can't be empty" });
    } else if (!(/^[a-zA-Z ]*$/.test(req.body.firstname))) {
        res.status(400).send({ error: "First name", message: "First name can only contain letters" });
    } else if ((req.body.firstname).trim().length > 15) {
        res.status(400).send({ error: "First name", message: "First name has maximum length of 15 letters" });
    }
    //Last name validation 
    else if (req.body.lastname == null) {
        res.status(400).send({ error: "Last name", message: "Last name paramter is missing" });
    } else if (!((typeof(req.body.lastname) === 'string') || ((req.body.lastname) instanceof String))) {
        res.status(400).send({ error: "Last name", message: "Last name must be a string" });
    } else if ((req.body.lastname).trim().length === 0) {
        res.status(400).send({ error: "Last name", message: "Last name can't be empty" });
    } else if (!(/^[a-zA-Z ]*$/.test(req.body.lastname))) {
        res.status(400).send({ error: "Last name", message: "Last name can only contain letters" });
    } else if ((req.body.lastname).trim().length > 15) {
        res.status(400).send({ error: "Last name", message: "Last name has maximum length of 15 letters" });
    }
    //Username validation
    else if (req.body.username == null) {
        res.status(400).send({ error: "Username", message: "Username paramter is missing" });
    } else if (!((typeof(req.body.username) === 'string') || ((req.body.firstname) instanceof String))) {
        res.status(400).send({ error: "Username", message: "Username must be a string" });
    } else if ((req.body.username).trim().length === 0) {
        res.status(400).send({ error: "Username", message: "Username can't be empty" });
    } else if (!(/^\S+$/.test(req.body.username))) {
        res.status(400).send({ error: "Username", message: "Username can't contain spaces" });
    } else if ((req.body.username).trim().length > 20) {
        res.status(400).send({ error: "Username", message: "Username has maximum length of 20 characters" });
    }
    //Email validation
    else if (req.body.email == null) {
        res.status(400).send({ error: "Email", message: "Email paramter is missing" });
    } else if (!((typeof(req.body.email) === 'string') || ((req.body.email) instanceof String))) {
        res.status(400).send({ error: "Email", message: "Email must be a string" });
    } else if ((req.body.email).trim().length === 0) {
        res.status(400).send({ error: "Email", message: "Email can't be empty" });
    } else if (!(/^\S+@\S+\.\S+$/.test(req.body.email))) {
        res.status(400).send({ error: "Email", message: "Email address is unvalid" });
    }
    //Phone number validation
    else if (req.body.phonenumber == null) {
        res.status(400).send({ error: "Phone number", message: "Phone number paramter is missing" });
    } else if (!((typeof(req.body.phonenumber) === 'string') || ((req.body.phonenumber) instanceof String))) {
        res.status(400).send({ error: "Phone number", message: "Phone number must be a string" });
    } else if ((req.body.phonenumber).trim().length === 0) {
        res.status(400).send({ error: "Phone number", message: "Phone number can't be empty" });
    } else if (!(/^[0-9]{11}$/.test(req.body.phonenumber))) {
        res.status(400).send({ error: "Phone number", message: "Phone number is unvalid" });
    }
    //Password validation
    else if (req.body.password == null) {
        res.status(400).send({ error: "Password", message: "Password paramter is missing" });
    } else if (!((typeof(req.body.password) === 'string') || ((req.body.password) instanceof String))) {
        res.status(400).send({ error: "Password", message: "Password must be a string" });
    } else if ((req.body.password).trim().length === 0) {
        res.status(400).send({ error: "Password", message: "Password can't be empty" });
    } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(req.body.password))) {
        res.status(400).send({ error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" });
    }
    //Confirm password validation
    else if (req.body.confirmpassword == null) {
        res.status(400).send({ error: "Confirm password", message: "Confirm password paramter is missing" });
    } else if (!((typeof(req.body.confirmpassword) === 'string') || ((req.body.confirmpassword) instanceof String))) {
        res.status(400).send({ error: "Confirm password", message: "Confirm password must be a string" });
    } else if ((req.body.confirmpassword).trim().length === 0) {
        res.status(400).send({ error: "Confirm password", message: "Password can't be empty" });
    } else if (!(req.body.password === req.body.confirmpassword)) {
        res.status(400).send({ error: "Confirm password ", message: "Passwords don't match" });
    }
    //Gender validation
    else if (req.body.gender == null) {
        res.status(400).send({ error: "Gender", message: "Gender paramter is missing" });
    } else if (!((typeof(req.body.gender) === 'string') || ((req.body.lastname) instanceof String))) {
        res.status(400).send({ error: "Gender", message: "Gender must be a string" });
    } else if ((req.body.gender).trim().length === 0) {
        res.status(400).send({ error: "Gender", message: "Gender can't be empty" });
    }
    //Birthdate validation
    else if (req.body.birthdate == null) {
        res.status(400).send({ error: "Birthdate", message: "Birthdate paramter is missing" });
    } else if (!((typeof(req.body.birthdate) === 'string') || ((req.body.birthdate) instanceof String))) {
        res.status(400).send({ error: "Birthdate", message: "Birthdate must be a string" });
    } else if ((req.body.birthdate).trim().length === 0) {
        res.status(400).send({ error: "Birthdate", message: "Birthdate can't be empty" });
    } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(req.body.birthdate))) {
        res.status(400).send({ error: "Birthdate", message: "Birthdate is unvalid" });
    }
    //Ride with validation
    else if (req.body.ridewith == null) {
        res.status(400).send({ error: "Ride with", message: "Ride with paramter is missing" });
    } else if (!((typeof(req.body.ridewith) === 'string') || ((req.body.lastname) instanceof String))) {
        res.status(400).send({ error: "Ride with", message: "Ride with must be a string" });
    } else if ((req.body.ridewith).trim().length === 0) {
        res.status(400).send({ error: "Ride with", message: "Ride with can't be empty" });
    }
    //Smoking validation
    else if (req.body.smoking == null) {
        res.status(400).send({ error: "Smoking", message: "Smoking paramter is missing" });
    } else if (!((typeof(req.body.smoking) === 'string') || ((req.body.lastname) instanceof String))) {
        res.status(400).send({ error: "Smoking", message: "Smoking must be a string" });
    } else if ((req.body.smoking).trim().length === 0) {
        res.status(400).send({ error: "Smoking", message: "Smoking can't be empty" });
    }
    //Latitude validation
    else if (req.body.latitude == null) {
        res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
    } else if (((req.body.latitude).toString()).trim().length === 0) {
        res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
    } else if ((typeof(req.body.latitude) === 'string') || ((req.body.confirmpassword) instanceof String)) {
        res.status(400).send({ error: "Latitude", message: "Latitude must be a decimal" });
    }
    //Longitude validation
    else if (req.body.longitude == null) {
        res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
    } else if (((req.body.longitude).toString()).trim().length === 0) {
        res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
    } else if ((typeof(req.body.longitude) === 'string') || ((req.body.confirmpassword) instanceof String)) {
        res.status(400).send({ error: "Longitude", message: "Longitude must be a decimal" });
    }
    //Organization ID check
    else if (req.body.organizationid == null) {
        res.status(400).send({ error: "Organization ID", message: "Organization ID paramter is missing" });
    } else if (usernameExists === 1) {
        res.status(409).send({ error: "Username", message: "This username already exists" });
    } else if (emailExists === 1) {
        res.status(409).send({ error: "Email", message: "This email already exists" });
    } else if (phonenumberExists === 1) {
        res.status(409).send({ error: "Phone number", message: "This phone number already exists" });
    } else {
        //Insert user 
        const createdUser = await User.create(userData);
        res.status(201).send({ message: "User is created" });
        res.end();
        //Insert org user 
        const orgUserData = {
            orgid: req.body.organizationid,
            userid: createdUser.id,
            distancetoorg: 0.0,
            timetoorg: 0.0,
            distancefromorg: 0.0,
            timefromorg: 0.0,
            status: 'existing'
        }
        await OrgUser.create(orgUserData);

        //Insert users in betweenusers
        await User.findAll({
            where: {
                [Op.and]: [
                    { id: {
                            [Op.ne]: createdUser.id } },
                    { status: 'existing' }
                ]
            }
        }).then(users => {
            if (users) {
                console.log(users);
                users.forEach(user => {
                    const betweenUsersData1 = {
                        user1id: user.id,
                        user2id: createdUser.id,
                        distance: 0.0,
                        time: 0.0,
                        trust: 0
                    }
                    const betweenUsersData2 = {
                        user1id: createdUser.id,
                        user2id: user.id,
                        distance: 0.0,
                        time: 0.0,
                        trust: 0
                    }
                    BetweenUsers.create(betweenUsersData1);
                    BetweenUsers.create(betweenUsersData2);
                });
            }
        }).catch(errHandler);
        var x = 4;
    }
});




module.exports = router;