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

router.post('/', async(req, res) => {
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to add a rating" })
        res.end();
    }

    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to add any rating" })
            res.end();
        }
    }).catch(errHandler)




    await User.findOne({
        where: {
            id: req.body.rateduserid,
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
            id: req.body.tripid
        }
    }).then(trip => {
        if (!trip) {
            ValidChecks = false;
            res.status(400).send({ message: "Invalid trip id" })
            res.end();
        }
    })

    if (!((typeof(req.body.rating) === 'number') || (req.body.rating).trim().length === 0) || req.body.rating > 5 || req.body.rating < 0) {
        ValidChecks = false
        res.status(400).send({ message: "Rating should be a number of value (1-5)" });
        res.end();

    }
    if (req.body.datetime == null) {
        res.status(400).send({ error: "datetime", message: "datetime paramter is missing" });
        ValidChecks = false;
        res.end()
    } else if (!((typeof(req.body.datetime) === 'string') || ((req.body.datetime) instanceof String))) {
        ValidChecks = false;
        res.status(400).send({ error: "datetime", message: "datetime must be a string" });
        res.end()
    } else if ((req.body.datetime).trim().length === 0) {
        ValidChecks = false;
        res.status(400).send({ error: "datetime", message: "datetime can't be empty" });
        res.end()
    } else if (!(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.test(req.body.datetime))) {
        res.status(400).send({ error: "datetime", message: "datetime is unvalid" });
        ValidChecks = false;
        res.end();
    }


    await User.findOne({
        where: {
            id: decoded.id,
            status: 'existing'
        }
    }).then(user => {
        if (user) {
            if (ValidChecks) {
                Rating.create({ userid: user.id, rateduserid: req.body.rateduserid, rating: req.body.rating, datetime: req.body.datetime, tripid: req.body.tripid }).
                then(rate => {
                    Rating.sum('rating', { where: { rateduserid: req.body.rateduserid } }).then(sum => {
                        Rating.count({ where: { rateduserid: req.body.rateduserid } }).then(count => {
                            User.update({ rating: (sum / count) }, { where: { id: req.body.rateduserid } }).
                            then(result => {
                                res.status(200).send("Rating updated")
                                console.log(" New Rating : ", (sum / count))
                            }).catch(errHandler)
                        })
                    }).catch(errHandler)

                }).catch(errHandler)
            }
        } else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler)
})


module.exports = router