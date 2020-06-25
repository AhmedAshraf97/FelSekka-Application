const User = require('../../models/users');
const Trust = require('../../models/betweenusers')
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const ExpiredToken = require('../../models/expiredtokens');


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    var jsonStr = '{"trustArr":[]}';
    var obj = JSON.parse(jsonStr);
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }
    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    const trustuser = await User.findOne({
        where: {
            username: req.body.username
        }
    })

    const trust = await Trust.findOne({
        where: {
            user1id: decoded.id,
            user2id: trustuser.id
        }
    }).catch(errHandler)
    obj['trustArr'].push(trust)

    const trust2 = await Trust.findOne({
        where: {

            user1id: trustuser.id,
            user2id: decoded.id
        }
    }).catch(errHandler)
    obj['trustArr'].push(trust2)

    res.status(200).send(obj)
    res.end();





})
module.exports = router