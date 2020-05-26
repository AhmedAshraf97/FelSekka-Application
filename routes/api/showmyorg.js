const OrgUser = require('../../models/orgusers');
const Organization = require('../../models/organizations');
const express = require('express');
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
router.post('/', async(req, res) => {
    var userExists = true;
    var decoded;
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
        var org = '{"count": [], "organizations":[]}';
        var obj = JSON.parse(org);
        var orgUserArray = {};
        var allExistingOrg = {};
        var count = 0;
        await OrgUser.findAll({ where: { userid: decoded.id, status: 'existing' } }).then(orgUsers => {
            orgUserArray = orgUsers;
        }).catch(errHandler);
        await Organization.findAll({ where: { status: "existing" } }).then(existingOrganizations => {
            allExistingOrg = existingOrganizations;
        }).catch(errHandler);
        orgUserArray.forEach(orgUser => {
            allExistingOrg.forEach(existingOrg => {
                if (orgUser.orgid === existingOrg.id) {
                    obj['organizations'].push(existingOrg);
                    count++;
                }
            })
        });
        obj['count'].push(count);
        if (count === 0) {
            res.status(409).send({ error: "No organizations found", message: "No organizations found" });
        } else {
            res.status(200).send(obj);
        }
    }
});

module.exports = router;