const User = require('../../models/users');
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
router.post('/signup', (req, res) => {
    //Object added to database
    const userData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            password: req.body.password,
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
    if (req.body.username == null) {
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
    } else {
        //Check wether username already exists
        const usernameExists = /*await*/ User.findOne({ where: { username: req.body.username } });
        //Check wether email already exists
        const emailExists = /*await*/ User.findOne({ where: { email: req.body.email } });
        //Check wether phone number already exists
        const phonenumberExists = /*await*/ User.findOne({ where: { phonenumber: req.body.phonenumber } });
        if (!(usernameExists === null)) {
            console.log(usernameExists instanceof User);
            console.log(usernameExists.username);
            res.status(409).send({ error: "Username", message: "This username already exists" });
        } else if (!(emailExists === null)) {
            res.status(409).send({ error: "Email", message: "This email already exists" });
        } else if (!(phonenumberExists === null)) {
            res.status(409).send({ error: "Phone number", message: "This phone number already exists" });
        } else {
            res.status(201).send({ message: "User is created" });
            console.log(userData);
        }

    }

});

//Sign in 
router.post('/signin', (req, res) => {
    User.findOne({
            where: {
                [Op.or]: [
                    { email: req.body.EmailOrPhone },
                    { phonenumber: req.body.EmailOrPhone }
                ]
            }
        }).then(user => {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: 1440
                })
                res.json({ token: token, userInfo: user.dataValues })
                console.log("User data ", user.dataValues)
            } else
                res.status(401).send({ message: "Invalid Password, Please try again" })
        })
        .catch(err => {
            res.status(400).send({ message: ' Invalid Email or Phone number ' })
        })
})

module.exports = router;