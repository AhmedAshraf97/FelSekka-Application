const User = require('../../models/users');
const Review = require('../../models/reviews')
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

    const revieweduser = await User.findOne({
        where: {
            username: req.body.username
        }
    })

    const review = await Review.findOne({
        where: {
            userid: decoded.id,
            revieweduserid: parseInt(revieweduser.id),
            tripid: parseInt(req.body.tripid)
        }
    }).catch(errHandler)
    if (review) {
        res.status(200).send(review)
        res.end();
    } else {
        res.status(409).send("message:No Reviews")
        res.end();

    }



})
module.exports = router