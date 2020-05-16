const betweenUsers = require('../../models/betweenusers');
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

    var decoded

    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized to update trust" })
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
        //User ID check
        if (req.body.userid == null) {
            res.status(400).send({ error: "User ID", message: "User ID paramter is missing" });
        }
        //OrganTrustID check
        else if (req.body.trust == null) {
            res.status(400).send({ error: "Trust", message: "Trust paramter is missing" });
        } else {
            await betweenUsers.update({ trust: req.body.trust }, {
                where: {
                    user1id: decoded.id,
                    user2id: req.body.userid
                }
            }).then(betweenuser => {
                res.status(200).send({ message: "Trust updated" });
            }).catch(errHandler);

        }
    }
});

module.exports = router;