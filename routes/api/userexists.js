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
    
    if(usernameExists === 1){
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