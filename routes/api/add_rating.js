const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const Rating = require('../../models/ratings');
const Trip = require('../../models//trips');
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

function validation(rating, datetime) {
    var validChecks = true;
    var message = ""
    if (!((typeof(parseInt(rating)) === 'number') || parseInt(rating).trim().length === 0) || parseInt(rating) > 5 || parseInt(rating) < 0) {
        validChecks = false
        message = { error: "rating", message: "Rating should be a number of value (1-5)" }
    }
    if (datetime == null) {
        validChecks = false;
        message = { error: "datetime", message: "datetime paramter is missing" }

    } else if (!((typeof(datetime) === 'string') || ((datetime) instanceof String))) {
        validChecks = false;
        message = { error: "datetime", message: "datetime must be a string" }

    } else if ((datetime).trim().length === 0) {
        validChecks = false;
        message = { error: "datetime", message: "datetime can't be empty" }

    } else if (!(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.test(datetime))) {
        message = { error: "datetime", message: "datetime is unvalid" }
        validChecks = false;

    }
    console.log(message)
    return { validChecks: validChecks, message: message }
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




    await User.findOne({
        where: {
            id: parseInt(req.body.rateduserid),
            status: 'existing'
        }
    }).then(user => {
        if (!user) {
            ValidChecks = false;
            res.status(400).send({ message: "Rated user doesn't exist" })
            res.end();

        }
    })




    await Trip.findOne({
        where: {
            id: parseInt(req.body.tripid)
        }
    }).then(trip => {
        if (!trip) {
            ValidChecks = false;
            res.status(400).send({ error: "Trip id", message: "Invalid trip id" })
            res.end();
        }
    })

    var result = validation(req.body.rating, req.body.datetime)
    if (result.validChecks) {
        await User.findOne({
            where: {
                id: decoded.id,
                status: 'existing'
            }
        }).then(user => {
            if (user) {
                if (ValidChecks) {
                    Rating.create({ userid: user.id, rateduserid: parseInt(req.body.rateduserid), rating: parseInt(req.body.rating), datetime: parseInt(req.body.datetime), tripid: parseInt(req.body.tripid) }).
                    then(rate => {
                        Rating.sum('rating', { where: { rateduserid: parseInt(req.body.rateduserid) } }).then(sum => {
                            Rating.count({ where: { rateduserid: parseInt(req.body.rateduserid) } }).then(count => {
                                User.update({ rating: (sum / count) }, { where: { id: parseInt(req.body.rateduserid) } }).
                                then(result => {
                                    res.status(200).send({ message: "Rating updated" })
                                    console.log(" New Rating : ", (sum / count))
                                }).catch(errHandler)
                            })
                        }).catch(errHandler)

                    }).catch(errHandler)
                }
            } else {
                res.status(404).send({ error: "User not found", message: "User not found" })
                res.end()
            }
        }).catch(errHandler)
    } else {
        res.status(400).send(result.message)
        res.end();

    }

})


module.exports = { router, validation }