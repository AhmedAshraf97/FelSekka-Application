const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const OfferFrom = require('../../models/offerridefrom')
const RequestFrom = require('../../models/requestridefrom')

const OfferTo = require('../../models/offerrideto')
const RequestTo = require('../../models/requestrideto')

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
        if (req.body.tofrom === "") {
            res.status(400).send({ error: "tofrom", message: "enter type request" });
            res.end()

        } else if (req.body.requestid === "") {
            res.status(400).send({ error: "requestid", message: "enter requestid" });
            res.end()

        } else {
            if (req.body.tofrom === "to") {
                var RequestToupdated = await RequestTo.update({
                    "status": "cancelled"

                }, {
                    where: {
                        id: parseInt(req.body.requestid),
                        "status": "pending"
                    }
                })
                if (!RequestToupdated) {
                    res.status(400).send({ error: "Request not found", message: "you can't cancel this request " })
                    res.end()
                } else {
                    res.status(200).send({ message: "The Request is cancelled" })
                    res.end()
                }
            } else {
                var RequestFromupdated = await RequestFrom.update({
                    "status": "cancelled"

                }, {
                    where: {
                        id: parseInt(req.body.requestid),
                        "status": "pending"
                    }
                })
                if (!RequestFromupdated) {
                    res.status(400).send({ error: "Request not found", message: "you can't cancel this request " })
                    res.end()
                } else {
                    res.status(200).send({ message: "The Request is cancelled" })
                    res.end()
                }

            }

        }
    }
});
module.exports = router;