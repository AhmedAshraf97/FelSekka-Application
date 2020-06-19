const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');

const Trip = require('../../models/trips');
const Rider = require('../../models/riders');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ExpiredToken = require('../../models/expiredtokens');



//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function validation(datetime, review) {
    var validChecks = true;
    if (review === undefined || (review).trim().length > 300 || (review).trim().length === 0) {
        validChecks = false;
        message = { error: "review", message: "Review size must be between (1-300) characters" }

    }

    if (datetime == null) {
        message = { error: "datetime", message: "datetime paramter is missing" }
        validChecks = false;
    } else if (!((typeof(datetime) === 'string') || ((datetime) instanceof String))) {
        validChecks = false;
        message = { error: "datetime", message: "datetime must be a string" }

    } else if ((datetime).trim().length === 0) {
        validChecks = false;
        res.status(400).send({ error: "datetime", message: "datetime can't be empty" });
        res.end()
    } else if (!(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.test(datetime))) {
        res.status(400).send({ error: "datetime", message: "datetime is unvalid" });
        validChecks = false;
        res.end();
    }
}
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


    if (req.body.review === undefined || (req.body.review).trim().length > 300 || (req.body.review).trim().length === 0) {
        ValidChecks = false;
        res.status(400).send({ error: "review", message: "Review size must be between (1-300) characters" });
        res.end();
    }



    await Trip.findOne({
        where: {
            id: req.body.tripid
        }
    }).then(trip => {
        if (!trip) {
            ValidChecks = false;
            res.status(400).send({ error: "trip id", message: "Invalid trip id" })
            res.end();
        }
    })


    await User.findOne({
        where: {
            id: req.body.reviewedid,
            status: 'existing'
        }
    }).then(user => {
        if (!user) {
            ValidChecks = false;
            res.status(400).send({ error: "Reviewed user id", message: "Reviewed user doesn't exist" });
            res.end();
        }
    }).catch(errHandler)

    //2008-09-01 12:35:45




    await User.findOne({
        where: {
            id: decoded.id,
            status: 'existing'
        }
    }).then(user => {
        if (user) {
            if (ValidChecks) {
                Review.create({ userid: user.id, revieweduserid: req.body.reviewedid, review: req.body.review, tripid: req.body.tripid, datetime: req.body.datetime })
                    .then(review => {
                        res.status(200).send({ message: "Review is added" });
                        res.end();
                    }).catch(errHandler);
            }
        } else {
            res.status(404).send({ error: "User not found", message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})


module.exports = router