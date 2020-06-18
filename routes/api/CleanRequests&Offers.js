const RequestTo = require('../../models/requestrideto')
const OfferTo = require('../../models/offerrideto')
const RequestFrom = require('../../models/requestridefrom')
const OfferFrom = require('../../models/offerridefrom')
const OrgUser = require('../../models/orgusers');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

function add_minutes(d1, miuntes) {

    var d2 = new Date(d1);
    d2.setMinutes(d1.getMinutes() + miuntes);
    return d2
}

router.post('/', async(req, res) => {

    var CancelledRequestsTo = []
    var CancelledOffersTo = []
    var CancelledRequestsFrom = []
    var CancelledOffersFrom = []

    const rides1 = await RequestFrom.findAll({
        where: {
            status: "pending"
        }
    }).catch(errHandler)

    const rides2 = await OfferFrom.findAll({
        where: {
            status: "pending"
        }
    }).catch(errHandler)

    const rides3 = await RequestTo.findAll({
        where: {
            status: "pending"
        }
    }).catch(errHandler)

    const rides4 = await OfferTo.findAll({
        where: {
            status: "pending"
        }
    }).catch(errHandler)


    for (ride of rides1) {
        var DepDateTime = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
        if (add_minutes(DepDateTime, 30) < new Date()) {
            CancelledRequestsFrom.push(ride.id)
        }
    }

    for (ride of rides2) {
        var DepDateTime = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
        if ((DepDateTime) < new Date) {
            CancelledOffersFrom.push(ride.id)
        }
    }

    for (ride of rides3) {
        var ArrivalDateTime = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());
        if (ArrivalDateTime < new Date) {
            CancelledRequestsTo.push(ride.id)
        }
    }

    for (ride of rides4) {
        var ArrivalDateTime = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());
        if (ArrivalDateTime < new Date) {
            CancelledOffersTo.push(ride.id)
        }
    }



    const cancell1 = await RequestFrom.update({ status: "cancelled" }, {
        where: {
            id: {
                [Op.in]: CancelledRequestsFrom
            }
        }
    })

    const cancell2 = await OfferFrom.update({ status: "cancelled" }, {
        where: {
            id: {
                [Op.in]: CancelledOffersFrom
            }
        }
    })

    const cancell3 = await RequestTo.update({ status: "cancelled" }, {
        where: {
            id: {
                [Op.in]: CancelledRequestsTo
            }
        }
    })

    const cancell4 = await OfferTo.update({ status: "cancelled" }, {
        where: {
            id: {
                [Op.in]: CancelledOffersTo
            }
        }
    })


    res.send({ "message:": "Cleaned" })
    res.end();

})


module.exports = router;