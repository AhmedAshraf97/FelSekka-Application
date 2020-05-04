const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const Offer = require('../../models/offerrideto')
const Request = require('../../models/requestrideto')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

class values {
    constructor(from, to, value) {
        this.from = from;
        this.to = to;
        this.value = value;
    }
}


function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {

    var Drivers = {}
    var driversCount = 0;
    var Riders = {}
    var ridersCount = 0;



    //    console.log(" Fil awal ", JSON.parse(JSON.stringify(Riders)))

    const offers = await Offer.findAll({
        where: {
            status: 'pending'
        },
        attributes: ['userid', 'toorgid', 'numberofseats', 'arrivaltime', 'date', 'ridewith', 'smoking', 'earliesttime']
    })
    if (offers.length > 0) {
        for (offer of offers) {
            const orguser = await OrgUser.findOne({
                where: {
                    orgid: offer.toorgid,
                    userid: offer.userid,
                    status: "existing"
                }

            })
            Drivers[driversCount] = ({
                "id": offer.userid,
                "DistanceToOrganization": orguser.distancetoorg,
                "TimeToOrganizationMinutes": orguser.timetoorg,
                "ArrivalTime": offer.arrivaltime,
                "EarliestStartTime": offer.earliesttime,
                "capacity": offer.numberofseats,
                "ridewith": offer.ridewith,
                "smoking": offer.smoking,
                "toorgid": offer.toorgid,
                "date": offer.date
            })
            driversCount++;
        }
    }

    await Offer.findAll({
        where: {
            status: 'pending'
        },
        attributes: ['userid', 'toorgid', 'numberofseats', 'arrivaltime', 'date', 'ridewith', 'smoking', 'earliesttime']
    }).then(
        offers => {}
    ).catch(errHandler)


    const requests = await Request.findAll({
        where: {
            status: 'pending'
        },
        attributes: ['userid', 'toorgid', 'arrivaltime', 'date', 'ridewith', 'smoking', 'earliesttime']
    });

    if (requests.length > 0) {

        for (const request of requests) {
            const orguser = await OrgUser.findOne({
                where: {
                    orgid: request.toorgid,
                    userid: request.userid,
                    status: "existing"
                }
            });

            Riders[ridersCount] = ({
                "id": request.userid,
                "DistanceToOrganization": orguser.distancetoorg,
                "TimeToOrganizationMinutes": orguser.timetoorg,
                "ArrivalTime": request.arrivaltime,
                "EarliestStartTime": request.earliesttime,
                "capacity": request.numberofseats,
                "ridewith": request.ridewith,
                "smoking": request.smoking,
                "toorgid": request.toorgid,
                "date": request.date
            });
            ridersCount++;

        }

    }
    var DRdistanceValue = []
    var DRdurationValue = []
    var RRdistanceValue = []
    var RRdurationValue = []

    if (Object.keys(Drivers).length > 0) {
        for (driver in Drivers) {
            for (rider in Riders) {
                if (Riders[rider].toorgid === Drivers[driver].toorgid && Riders[rider].ridewith === Drivers[driver].ridewith &&
                    Riders[rider].smoking === Drivers[driver].smoking &&
                    diff_minutes((new Date(Riders[rider].date + " " + Riders[rider].ArrivalTime)), (new Date(Drivers[driver].date + " " + Drivers[driver].ArrivalTime))) >= 0 &&
                    diff_minutes((new Date(Riders[rider].date + " " + Riders[rider].ArrivalTime)), (new Date(Drivers[driver].date + " " + Drivers[driver].ArrivalTime))) <= 30

                ) {

                    const FromDriverToRider = await BetweenUsers.findOne({
                        where: {
                            user1id: Drivers[driver].id,
                            user2id: Riders[rider].id

                        }

                    })
                    var valueDuration = new values(FromDriverToRider.user1id, FromDriverToRider.user2id, parseFloat(FromDriverToRider.time))
                    var valueDistance = new values(FromDriverToRider.user1id, FromDriverToRider.user2id, parseFloat(FromDriverToRider.distance))

                    DRdurationValue.push(valueDuration)
                    DRdistanceValue.push(valueDistance)

                }

            }

        }
    }



    console.log("Drivers heeehh ", Drivers)
    console.log("Riderss heeehh ", Riders)

});




module.exports = router;