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
router.post('/', async(req, res) => {
    var decoded;
    var userExists = true;

    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)

    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized to add an organization" })
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
        //Name validation
        if (req.body.name == null) {
            res.status(400).send({ error: "Name", message: "Name paramter is missing" });
        } else if (!((typeof(req.body.name) === 'string') || ((req.body.name) instanceof String))) {
            res.status(400).send({ error: "Name", message: "Name must be a string" });
        } else if ((req.body.name).trim().length === 0) {
            res.status(400).send({ error: "Name", message: "Name can't be empty" });
        } else if (!(/^[a-zA-Z ]*$/.test(req.body.name))) {
            res.status(400).send({ error: "Name", message: "Name can only contain letters" });
        } else if ((req.body.name).trim().length > 30) {
            res.status(400).send({ error: "Name", message: "Name has maximum length of 30 letters" });
        }
        //Domain validation
         else if (req.body.domain == null) {
            res.status(400).send({ error: "Domain", message: "Domain paramter is missing" });
        } else if (!((typeof(req.body.domain) === 'string') || ((req.body.domain) instanceof String))) {
            res.status(400).send({ error: "Domain", message: "Domain must be a string" });
        } else if ((req.body.domain).trim().length === 0) {
            res.status(400).send({ error: "Domain", message: "Domain can't be empty" });
        } 
        //Latitude validation
        else if (req.body.latitude == null) {
            res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
        } else if (((req.body.latitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
        } 
        //Longitude validation
        else if (req.body.longitude == null) {
            res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
        } else if (((req.body.longitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
        } else {
            //Insert org user 
            const orgData = {
                name: req.body.name,
                longitude: parseFloat(req.body.longitude),
                latitude: parseFloat(req.body.latitude),
                domain: req.body.domain,
                status: 'pending'
            }
            await Organization.create(orgData).then(user => {
                res.status(200).send({ message: "Organization is created, it will be reviewed by admin for acceptance" });
            }).catch(errHandler);

        }
    }
});




module.exports = router;