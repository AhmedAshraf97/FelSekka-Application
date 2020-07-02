const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const OfferTo = require('../../models/offerrideto')
const OfferFrom = require('../../models/offerridefrom')
const Car = require('../../models/cars')
const Organization = require('../../models/organizations')

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

                    const car = await Car.findOne({
                        where: {
                            id: offerFrom.carid,
                            status: "existing"
                        }
                    })
                    const org = await Organization.findOne({
                        where: {
                            id: offerFrom.fromorgid,
                            status: "existing"
                        }
                    })

                    offerFrom = offerFrom.toJSON();
                    offerFrom.carModel = car.model
                    offerFrom.carBrand = car.brand
                    offerFrom.carYear = car.year
                    offerFrom.carType = car.type
                    offerFrom.carColor = car.color
                    offerFrom.carPlateletters = car.plateletters
                    offerFrom.carPlatenumbers = car.platenumbers
                    offerFrom.orgname = org.name
                    offerFrom.orglatitude = org.latitude
                    offerFrom.orglongitude = org.longitude
                    offerFrom.tofrom = "from"
                    offerFrom.fromlatitude = ""
                    offerFrom.fromlongitude = ""
                    offerFrom.toorgid = ""
                    offerFrom.arrivaltime = ""
                    offerFrom.earliesttime = ""

                    obj['Offers'].push(offerFrom)
                }

                for (offerTo of offersTo) {

                    const car = await Car.findOne({
                        where: {
                            id: offerTo.carid,
                            status: "existing"
                        }
                    })
                    const org = await Organization.findOne({
                        where: {
                            id: offerTo.toorgid,
                            status: "existing"
                        }
                    })

                    offerTo = offerTo.toJSON();
                    offerTo.carModel = car.model
                    offerTo.carBrand = car.brand
                    offerTo.carYear = car.year
                    offerTo.carType = car.type
                    offerTo.carColor = car.color
                    offerTo.carPlateletters = car.plateletters
                    offerTo.carPlatenumbers = car.platenumbers
                    offerTo.orgname = org.name
                    offerTo.orglatitude = org.latitude
                    offerTo.orglongitude = org.longitude
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