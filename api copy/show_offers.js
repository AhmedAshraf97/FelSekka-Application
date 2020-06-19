const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const OfferTo = require('../../models/offerrideto')
const OfferFrom = require('../../models/offerridefrom')

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


    var jsonStr = '{"Offers":[]}';
    var obj = JSON.parse(jsonStr);


    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
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


    const user = await User.findOne({
        where: {
            id: decoded.id,
            status: 'existing'
        }
    }).catch(errHandler);

    if (user) {
        if (ValidChecks) {
            const offersFrom = await OfferFrom.findAll({
                where: {
                    status: 'pending',
                    userid: decoded.id
                }
            });
            const offersTo = await OfferTo.findAll({
                where: {
                    status: 'pending',
                    userid: decoded.id
                }
            });

            if (offersTo.length == 0 && offersFrom.length == 0) {

                res.status(409).send({ error: "No pending offers", message: "No pending offers" })
                res.end();
            } else {
                for (offerFrom of offersFrom) {

                    offerFrom = offerFrom.toJSON();
                    offerFrom.tofrom = "from"
                    offerFrom.fromlatitude = ""
                    offerFrom.fromlongitude = ""
                    offerFrom.toorgid = ""
                    offerFrom.arrivaltime = ""
                    offerFrom.earliesttime = ""

                    obj['Offers'].push(offerFrom)
                }

                for (offerTo of offersTo) {
                    offerTo = offerTo.toJSON();
                    offerTo.tofrom = "to"
                    offerTo.tolatitude = ""
                    offerTo.tolongitude = ""
                    offerTo.fromorgid = ""
                    offerTo.departuretime = ""
                    offerTo.latesttime = ""

                    obj['Offers'].push(offerTo)
                }
                res.status(200).send(obj)
                res.end()
            }

        }
    } else {
        res.status(404).send({ message: "User not found" })
        res.end();
    }

})


module.exports = router