const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
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

router.post('/', async(req, res) => {
    var ReviewsArr = {}
    var count = 0
    var ValidChecks = true;
    var decoded;
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
            username: req.body.username,
            status: 'existing'
        }
    }).then(user => {
            var jsonStr = '{"reviews":[]}';
            var obj = JSON.parse(jsonStr);

            if (user) {
                if (ValidChecks) {
                    Review.findAll({
                            where: {
                                revieweduserid: user.id
                            }
                        }).then(reviews => {
                            if (reviews.length > 0) {
                                reviews.forEach(review => {
                                    if (review) {
                                        Driver.findOne({
                                            where: {
                                                tripid: review.tripid,
                                                driverid: review.revieweduserid
                                            }
                                        }).then(driver => {
                                            if (driver) {
                                                //ReviewsArr[count] = ({ type: "driver", "review": review.review })
                                                obj['reviews'].push({ "type": "driver", "review": review.review });
                                                count++;
                                                if (count === reviews.length) {
                                                    res.send(obj)
                                                }

                                            } else {
                                                Rider.findOne({
                                                    where: {
                                                        tripid: review.tripid,
                                                        riderid: review.revieweduserid
                                                    }
                                                }).then(rider => {
                                                    if (rider) {
                                                        obj['reviews'].push({ "type": "rider", "review": review.review });

                                                        count++;
                                                        if (count === reviews.length) {
                                                            console.log("COUNT", count)
                                                            res.send(obj)
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                res.status(409).send({ error: "No Reviews", message: "No Reviews" })
                                res.end()
                            }
                        })
                        .catch(errHandler)
                }
            } else {
                res.status(404).send({ error: "User not found", message: "User not found" })
                res.end()
            }
        }

    ).catch(errHandler)
})

module.exports = router