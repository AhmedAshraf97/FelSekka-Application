const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async (req, res) => {
    let usernameExists = 0;
    let  emailExists = 0;
    let phonenumberExists = 0;
    //Check wether username already exists
    if(req.body.username != null) {
    await User.findOne({ where: { username: req.body.username }}).then(user=>{
        if(user){
            usernameExists =1;
        } 
    }).catch(errHandler);}
    //Check wether email already exists
    if(req.body.email != null) {
    await User.findOne({ where: { email: req.body.email }}).then(user=>{
        if(user){
            emailExists =1;
        }
    }).catch(errHandler);}
    //Check wether phone number already exists
    if(req.body.phonenumber != null) {
    await  User.findOne({ where: { phonenumber: req.body.phonenumber }}).then(user=>{
        if(user){
            phonenumberExists =1; 
        }
    }).catch(errHandler);}
    // First name validation 
    if (req.body.firstname == null) {
        res.status(400).send({ error: "First name", message: "First name paramter is missing" });
    } else if (!((typeof(req.body.firstname) === 'string') || ((req.body.firstname) instanceof String))) {
        res.status(400).send({ error: "First name", message: "First name must be a string" });
    }else if ((req.body.firstname).trim().length === 0) {
        res.status(400).send({ error: "First name", message: "First name can't be empty" });
    } else if (!(/^[a-zA-Z ]*$/.test(req.body.firstname))) {
        res.status(400).send({ error: "First name", message: "First name can only contain letters" });
    }else if ((req.body.firstname).trim().length > 15) {
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
    } else if (!((typeof(req.body.username) === 'string') || ((req.body.username) instanceof String))) {
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
    else if(usernameExists === 1){
        res.status(409).send( {error: "Username", message: "This username already exists"});   
    }
    else if (emailExists === 1){  
        res.status(409).send( {error: "Email", message: "This email already exists"});
    }    
    else if(phonenumberExists === 1){
        res.status(409).send( {error: "Phone number", message: "This phone number already exists"});
    }
    else {
        res.status(200).send( {message: "OK"});
    }
});

module.exports = router;