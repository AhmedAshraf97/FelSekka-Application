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
    //Gender validation
     if (req.body.gender == null) {
        res.status(400).send({ error: "Gender", message: "Gender paramter is missing" });
    } else if (!((typeof(req.body.gender) === 'string') || ((req.body.gender) instanceof String))) {
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
    } else if (!((typeof(req.body.ridewith) === 'string') || ((req.body.ridewith) instanceof String))) {
        res.status(400).send({ error: "Ride with", message: "Ride with must be a string" });
    } else if ((req.body.ridewith).trim().length === 0) {
        res.status(400).send({ error: "Ride with", message: "Ride with can't be empty" });
    }
    //Smoking validation
    else if (req.body.smoking == null) {
        res.status(400).send({ error: "Smoking", message: "Smoking paramter is missing" });
    } else if (!((typeof(req.body.smoking) === 'string') || ((req.body.smoking) instanceof String))) {
        res.status(400).send({ error: "Smoking", message: "Smoking must be a string" });
    } else if ((req.body.smoking).trim().length === 0) {
        res.status(400).send({ error: "Smoking", message: "Smoking can't be empty" });
    }
    else {
        res.status(200).send( {message: "OK"});
    }
});

module.exports = router;