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


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.post('/', (req, res) => {
    var decoded;
    var ValidChecks = true;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        res.status(401).send({ message: "You aren't authorized to add a review" })
        res.end();
    }
    if ((req.body.review).trim().length > 300) {
        ValidChecks = false;
        res.status(400).send({ message: "Review Size must be less than 300 characters" });
        res.end();
    }

    User.findOne({
        where: {
            id: decoded.id
        }
    }).then(user => {
        if (user) {
            if (ValidChecks) {
                Review.create({ userid: user.id, revieweduserid: req.body.reviewedid, review: req.body.review, tripid: req.body.tripid })
                    .then(review => {
                        res.status(201).send({ message: "review is added" });
                        res.end();
                    }).catch(errHandler);
            }
        } else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler)

})


module.exports = router