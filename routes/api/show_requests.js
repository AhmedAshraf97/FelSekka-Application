const User = require('../../models/users');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const RequestTo = require('../../models/requestrideto')
const RequestFrom = require('../../models/requestridefrom')
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

    var jsonStr = '{"Requests":[]}';
    var obj = JSON.parse(jsonStr);
    const user = await User.findOne({
        where: {
            id: decoded.id,
            status: 'existing'
        }
    }).catch(errHandler);

    if (user) {
        if (ValidChecks) {
            const requestsFrom = await RequestFrom.findAll({
                where: {
                    status: 'pending',
                    userid: decoded.id
                }
            });
            const requestsTo = await RequestTo.findAll({
                where: {
                    status: 'pending',
                    userid: decoded.id
                }
            });

            if (requestsFrom.length == 0 && requestsTo.length == 0) {

                res.status(409).send({ error: "No pending requests", message: "No pending requests" })
                res.end();
            } else {
                for (requestFrom of requestsFrom) {

                    const org = await Organization.findOne({
                        where: {
                            id: requestFrom.fromorgid,
                            status: "existing"
                        }
                    })

                    requestFrom = requestFrom.toJSON();

                    requestFrom.orgname = org.name
                    requestFrom.orglatitude = org.latitude
                    requestFrom.orglongitude = org.longitude

                    requestFrom.tofrom = "from"
                    requestFrom.fromlatitude = ""
                    requestFrom.fromlongitude = ""
                    requestFrom.toorgid = ""
                    requestFrom.arrivaltime = ""
                    requestFrom.earliesttime = ""

                    obj['Requests'].push(requestFrom)
                }

                for (requestTo of requestsTo) {

                    const org = await Organization.findOne({
                        where: {
                            id: requestTo.toorgid,
                            status: "existing"
                        }
                    })

                    requestTo = requestTo.toJSON();

                    requestTo.orgname = org.name
                    requestTo.orglatitude = org.latitude
                    requestTo.orglongitude = org.longitude

                    requestTo.tofrom = "to"
                    requestTo.tolatitude = ""
                    requestTo.tolongitude = ""
                    requestTo.fromorgid = ""
                    requestTo.departuretime = ""
                    requestTo.latesttime = ""

                    obj['Requests'].push(requestTo)
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