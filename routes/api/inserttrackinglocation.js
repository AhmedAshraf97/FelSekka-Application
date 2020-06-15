const tracking = require('../../models/trackings');
const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
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
    var decoded;
    var userExists = true;

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

    if (userExists) {
        //Latitude validation
         if (req.body.latitude == null) {
            res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
        } else if (((req.body.latitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
        }
        //Longitude validation
        else if (req.body.longitude == null) {
            res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
        } else if (((req.body.longitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
        } else {
            //Insert org user 
            const trackingdata = {
                driverid: parseInt(req.body.driverid),
                tripid: parseInt(req.body.tripid),
                longitude: parseFloat(req.body.longitude),
                latitude: parseFloat(req.body.latitude)
            }
            await tracking.create(trackingdata).then(user => {
                res.status(200).send({ message: "Tracking location is inserted" });
            }).catch(errHandler);

        }
    }
});




module.exports = router;