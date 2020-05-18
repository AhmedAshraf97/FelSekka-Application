const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const OfferFrom = require('../../models/offerridefrom')
const RequestFrom = require('../../models/requestridefrom')

const OfferTo = require('../../models/offerrideTo')
const RequestTo = require('../../models/requestrideTo')

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
        res.status(401).send({ message: "You aren't authorized to cancel trip" })
        res.end();
    }
    await ExpiredToken.findOne({
        where: {
            token: req.headers["authorization"]
        }
    }).then(expired => {
        if (expired) {
            ValidChecks = false;
            res.status(401).send({ message: "You aren't authorized to cancel trip" })
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
            res.status(400).send({ error: "tofrom", message: "enter type offer" });
            res.end()

        } else if (req.body.offerid === "") {
            res.status(400).send({ error: "offerid", message: "enter offerid" });
            res.end()

        } else {
            if (req.body.tofrom === "to") {
                var offerToupdated = await OfferTo.update({
                    "status": "cancelled"

                }, {
                    where: {
                        id: parseInt(req.body.offerid),
                        "status": "pending"
                    }
                })
                if (!offerToupdated) {
                    res.status(400).send("you can't cancel this offer ")
                    res.end()
                } else {
                    res.status(200).send("The offer is cancelled ")
                    res.end()
                }
            } else {
                var offerFromupdated = await OfferFrom.update({
                    "status": "cancelled"

                }, {
                    where: {
                        id: parseInt(req.body.offerid),
                        "status": "pending"
                    }
                })
                if (!offerFromupdated) {
                    res.status(400).send("you can't cancel this offer")
                    res.end()
                } else {
                    res.status(200).send("The offer is cancelled ")
                    res.end()
                }

            }

        }
    }
});
module.exports = router;