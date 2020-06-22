const OrgUser = require('../../models/orgusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(name, domain, latitude, longitude) {
    var validChecks = true
    var message = ""
    if (name == null) {
        validChecks = false;
        message = { error: "Name", message: "Name parameter is missing" }
    } else if (!((typeof(name) === 'string') || ((name) instanceof String))) {
        validChecks = false;
        message = { error: "Name", message: "Name must be a string" }
    } else if ((name).trim().length === 0) {
        validChecks = false;
        message = { error: "Name", message: "Name can't be empty" }
    } else if (!(/^[a-zA-Z ]*$/.test(name))) {
        validChecks = false;
        message = { error: "Name", message: "Name can only contain letters" }
    } else if ((name).trim().length > 30) {
        validChecks = false;
        message = { error: "Name", message: "Name has maximum length of 30 letters" }
    }
    //Domain validation
    else if (domain == null) {
        validChecks = false;
        message = { error: "Domain", message: "Domain parameter is missing" }
    } else if (!((typeof(domain) === 'string') || ((domain) instanceof String))) {
        validChecks = false;
        message = { error: "Domain", message: "Domain must be a string" }
    } else if ((domain).trim().length === 0) {
        validChecks = false;
        message = { error: "Domain", message: "Domain can't be empty" }
    }
    //Latitude validation
    else if (latitude == null) {
        validChecks = false;
        message = { error: "Latitude", message: "Latitude parameter is missing" }
    } else if (((latitude).toString()).trim().length === 0) {
        validChecks = false;
        message = { error: "Latitude", message: "Latitude can't be empty" }
    } else if (longitude == null) {
        validChecks = false;
        message = { error: "Longitude", message: "Longitude parameter is missing" }
    } else if (((longitude).toString()).trim().length === 0) {
        validChecks = false;
        message = { error: "Longitude", message: "Longitude can't be empty" }
    }
    return { validChecks: validChecks, message: message }
}
router.post('/', async(req, res) => {
    var decoded;
    var userExists = true;

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
            res.status(401).send({ message: "You aren't authorized" })
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

        var result = validation(req.body.name, req.body.domain, req.body.latitude, req.body.longitude)
        if (result.validChecks) {
            const orgData = {
                name: req.body.name,
                longitude: parseFloat(req.body.longitude),
                latitude: parseFloat(req.body.latitude),
                domain: req.body.domain,
                status: 'pending'
            }
            await Organization.create(orgData).then(user => {
                res.status(200).send({ message: "Organization is created" });
            }).catch(errHandler);
        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }
});




module.exports = { router, validation };