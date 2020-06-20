const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const Offer = require('../../models/offerridefrom')
const Request = require('../../models/requestridefrom')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const matching = require('../../matching');
const Trips = require('../../models/trips')
const DriverDB = require('../../models/drivers');
const RiderDB = require('../../models/riders');



const ExpiredToken = require('../../models/expiredtokens');
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

    const user = await User.findOne({
        where: {
            id: decoded.id,
            status: "existing"
        }
    }).catch(errHandler)
    if (!user) {
        ValidChecks = false;
        res.status(404).send({ message: "User not found" })
        res.end()
    }

    if (ValidChecks) {

        const trip = await Trips.findOne({
            where: {
                id: req.body.tripid,
                status: "scheduled"
            }
        }).catch(errHandler)
        if (trip) {
            const driverTrip = await DriverDB.findOne({
                where: {
                    tripid: trip.id,
                    status: "scheduled"
                }
            }).catch(errHandler)
            if (driverTrip.driverid === user.id) {
                const offer = await Offer.findOne({
                    where: {
                        id: driverTrip.offerid,
                        status: "scheduled"

                    }
                }).catch(errHandler)

                const RidersTrip = await RiderDB.findAll({
                    where: {
                        tripid: trip.id,
                        status: "scheduled"
                    }

                }).catch(errHandler)
                if (RidersTrip.length > 0) {

                    await Trips.update({
                        status: "cancelled"
                    }, {
                        where: {
                            id: trip.id

                        }
                    }).catch(errHandler)

                    await DriverDB.update({
                        status: "cancelled"
                    }, {
                        where: {
                            driverid: driverTrip.driverid,
                            tripid: trip.id

                        }
                    }).catch(errHandler)

                    await Offer.update({
                        status: "cancelled",

                    }, {
                        where: {
                            userid: driverTrip.driverid,
                            id: offer.id

                        }
                    }).catch(errHandler)
                    for (const RiderTrip of RidersTrip) {

                        await RiderDB.update({
                            status: "cancelled",
                        }, {
                            where: {
                                riderid: RiderTrip.riderid,
                                tripid: trip.id

                            }
                        }).catch(errHandler)

                        await Request.update({
                            status: "cancelled",

                        }, {
                            where: {
                                userid: RiderTrip.riderid,
                                id: RiderTrip.requestid
                            }
                        }).catch(errHandler)
                    }





                    res.send({ message: "The trip is cancelled" })
                    res.end()



                }
            } else {
                res.status(400).send({ error: "You aren't the driver", message: "you aren't the driver" })
                res.end()

            }
        } else {
            res.status(400).send({ error: "Trip id", message: "enter valid trip id" });
            res.end()
        }
    }
})

module.exports = { router }