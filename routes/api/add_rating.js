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
    if (!((typeof(parseFloat(rating)) === 'number') || parseFloat(rating).trim().length === 0) || parseFloat(rating) > 5 || parseFloat(rating) < 0 ||
        !(/^([0-9]+)$/.test(rating))
    ) {
        validChecks = false
        message = { error: "rating", message: "Rating should be a number of value (1-5)" }
    } else
    if (datetime == null) {
        validChecks = false;
        message = { error: "datetime", message: "datetime parameter is missing" }

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




    const rateduser = await User.findOne({
        where: {
            username: req.body.ratedusername,
            status: 'existing'
        }
    }).catch(errHandler)

    if (!rateduser) {
        ValidChecks = false;
        res.status(400).send({ message: "Rated user doesn't exist" })
        res.end();

    }


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
                    Rating.create({ userid: user.id, rateduserid: parseInt(rateduser.id), rating: parseFloat(req.body.rating), datetime: parseInt(req.body.datetime), tripid: parseInt(req.body.tripid) }).
                    then(rate => {
                        Rating.sum('rating', { where: { rateduserid: parseInt(rateduser.id) } }).then(sum => {
                            Rating.count({ where: { rateduserid: parseInt(rateduser.id) } }).then(count => {
                                User.update({ rating: ((5 + sum) / (count + 1)) }, { where: { id: parseInt(rateduser.id) } }).
                                then(result => {
                                    res.status(200).send({ message: "Rating updated" })
                                    console.log(" New Rating : ", ((sum + 5) / (count + 1)))
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