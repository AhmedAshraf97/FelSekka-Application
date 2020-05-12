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
        //Organization ID check
        if (req.body.organizationid == null) {
            res.status(400).send({ error: "Organization ID", message: "Organization ID paramter is missing" });
        } else if (((req.body.organizationid).toString()).trim().length === 0) {
            res.status(400).send({ error: "Organization ID", message: "Organization ID can't be empty" });
        } else {
            await Organization.update({ status: "existing" }, {
                where: {
                    id: req.body.organizationid
                }
            }).then(user => {
                res.status(200).send({ message: "Organization is Accepted" });
            }).catch(errHandler);

        }
    }
});

module.exports = router;