const OrgUser = require('../../models/orgusers');
const express = require('express');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(orgid) {
    var validChecks = true;
    var message = ""
    if (orgid == null) {
        message = { error: "Organization ID", message: "Organization ID paramter is missing" }
        validChecks = false;
    } else if (((orgid).toString()).trim().length === 0) {
        message = { error: "Organization ID", message: "Organization ID can't be empty" }
        validChecks = false;

    } else if (!(/^([0-9]+)$/.test(parseInt(orgid)))) {
        message = { error: "Organization ID", message: "Organization ID must be a number" }
        validChecks = false;
    }

    return { validChecks: validChecks, message: message }
}
router.post('/', async(req, res) => {
    var userExists = true;

    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized to add a rating" })
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
        var result = validation(req.body.orgid, res)
        if (result.validChecks) {
            await Organization.update({ status: "existing" }, {
                where: {
                    id: parseInt(req.body.orgid),
                    status: "pending"
                }
            }).then(user => {
                if (user[0] !== 0) {
                    res.status(200).send({ message: "Organization is Accepted" });
                } else {
                    res.status(400).send({ message: "Cannot accept the organization" });
                }
            }).catch(errHandler);

        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }
});

module.exports = { router, validation };