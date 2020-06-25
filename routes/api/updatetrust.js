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


function validation(userid, trust) {
    var validChecks = true;
    var message;
    if (userid == null) {
        message = { error: "User ID", message: "User ID parameter is missing" };
        validChecks = false;
    } else if (trust == null) {
        message = { error: "Trust", message: "Trust parameter is missing" };
        validChecks = false;
    } else if (!(parseInt(trust) == 0 || parseInt(trust) == 1 || parseInt(trust) == -1)) {
        message = { error: "Trust", message: "Trust parameter must be -1 or 0 or 1" };
        validChecks = false;
    }

    return { validChecks: validChecks, message: message }
}

router.post('/', async(req, res) => {
    var userExists = true;

    var decoded

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

    var trusteduser = await User.findOne({
        where: {
            username: req.body.trustedusername,
            status: 'existing'
        }
    }).catch(errHandler)

    if (userExists) {
        var result = validation(trusteduser.id, req.body.trust)
        if (result.validChecks) {
            await betweenUsers.update({ trust: req.body.trust }, {
                where: {
                    user1id: decoded.id,
                    user2id: trusteduser.id
                }
            }).then(betweenuser => {
                res.status(200).send({ message: "Trust updated" });
            }).catch(errHandler);

        } else {
            res.status(400).send(result.message)
            res.end()
        }
    }
});

module.exports = { router, validation };