const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const requestRideFrom = require('../models/requestridefrom');
const requestRideTo = require('../models/requestrideto');
const offerRideFrom = require('../models/offerridefrom');
const offerRideTo = require('../models/offerrideto');
const Trips = require('../models/trips')
const Rider = require('../models/riders');
//scheduledTrip,offerTo/From,requestTo/From,cancel to/from,
//todo:end,start, show past trips
var CurrentToken = 0;

var tripidFrom = 0
var tripidTo = 0
process.env.SECRET_KEY = 'secret';
const jwt = require('jsonwebtoken');
beforeAll(done => {
    done()
})
afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    dbConnection.close();
    done();
});

test('Signing in', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "nadineshawkat@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken = response.body.token

}, 100000)

test('Scheduled trips', async() => {
    const response = await request(app)
        .post('/api/scheduledtrips')
        .set('Authorization', CurrentToken).expect(200)
        // console.log(JSON.stringify(response.body))

}, 100000)

test('Choose from available to-organization trips with assigned trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "to",
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    tripidTo = resultbefore.tripid
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidTo

        }
    });
    const response = await request(app)

    .post('/api/chooseFromAvailableRides')
        .send({
            "tripid": tripidTo,
            "earliesttime": "02:40:00"
        }).set('Authorization', CurrentToken).expect(400)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidTo
        }
    })

    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats)
    expect(response.body.message).toBe("You are already in this trip")

}, 100000)


test('cancel rider To-Organization trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "to",
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    tripidTo = resultbefore.tripid
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: resultbefore.tripid

        }
    });

    const response = await request(app)
        .post('/api/cancelRiderTo')
        .send({
            tripid: resultbefore.tripid
        }).set('Authorization', CurrentToken).expect(200)


    const resultAfterRider = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "to",
            tripid: resultbefore.dataValues.tripid

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    const resultAfterTrip = await Trips.findOne({
        where: {
            id: resultbefore.dataValues.tripid
        }
    })

    const resultAfterRequest = await requestRideTo.findOne({
        where: {
            id: resultbefore.dataValues.requestid
        }
    })

    expect(resultAfterRider.dataValues.status).toBe("cancelled")
    expect(resultAfterRequest.dataValues.status).toBe("cancelled")
    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats - 1)

}, 100000)


test('cancel rider To-Organization trip with unassigned trip id', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)


    const response = await request(app)
        .post('/api/cancelRiderTo')
        .send({
            tripid: tripidTo
        }).set('Authorization', CurrentToken).expect(401)
    expect(response.body.message).toBe("you aren't assigned")
        //with canceled trip




}, 100000)

test('cancel rider To-Organization trip with invalid trip id', async() => {

    const response = await request(app)
        .post('/api/cancelRiderTo')
        .send({
            tripid: 1
        }).set('Authorization', CurrentToken).expect(401)
    expect(response.body.message).toBe("No trip found")
        //with canceled trip




}, 100000)
test('Choose from available to-organization trips with invalid earliest', async() => {

    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidTo

        }
    });
    const response = await request(app)

    .post('/api/chooseFromAvailableRides')
        .send({
            "tripid": tripidTo,
            "earliesttime": "03:50:00"
        }).set('Authorization', CurrentToken).expect(400)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidTo
        }
    })

    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats)
    expect(response.body.message).toBe("Your location or earliest time don't match")

}, 100000)

test('Choose from available to-organization trips', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidTo

        }
    });
    const response = await request(app)

    .post('/api/chooseFromAvailableRides')
        .send({
            "tripid": tripidTo,
            "earliesttime": "02:40:00"
        }).set('Authorization', CurrentToken).expect(200)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidTo
        }
    })

    const resultAfterRequest = await requestRideTo.findOne({
        where: {
            userid: decoded.id

        },
        order: [
            ['updatedAt', 'DESC']
        ],
    })

    const resultAfterRider = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "to",
            tripid: tripidTo

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    expect(resultAfterRider.dataValues.status).toBe("scheduled")
    expect(resultAfterRequest.dataValues.status).toBe("scheduled")
    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats + 1)


}, 100000)


test('Choose from available Return-organization trips with assigned trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "from",
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    tripidFrom = resultbefore.tripid
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidFrom

        }
    });
    const response = await request(app)

    .post('/api/chooseFromReturnTripsApi')
        .send({
            "tripid": tripidTo,
            "latesttime": "05:30:00"
        }).set('Authorization', CurrentToken).expect(400)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidFrom
        }
    })

    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats)
    expect(response.body.message).toBe("You are already in this trip")

}, 100000)

test('cancel rider From-Organization trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "from",
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    tripidFrom = resultbefore.tripid
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: resultbefore.tripid

        }
    });

    const response = await request(app)
        .post('/api/cancelRiderFrom')
        .send({
            tripid: resultbefore.tripid
        }).set('Authorization', CurrentToken).expect(200)


    const resultAfterRider = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "from",
            tripid: resultbefore.dataValues.tripid

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    const resultAfterTrip = await Trips.findOne({
        where: {
            id: resultbefore.dataValues.tripid
        }
    })

    const resultAfterRequest = await requestRideFrom.findOne({
        where: {
            id: resultbefore.dataValues.requestid
        }
    })

    expect(resultAfterRider.dataValues.status).toBe("cancelled")
    expect(resultAfterRequest.dataValues.status).toBe("cancelled")
    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats - 1)

}, 100000)


// test('cancel rider From-Organization trip in unassigned trips', async() => {

//     const response = await request(app)
//         .post('/api/cancelRiderFrom')
//         .send({
//             tripid: tripidFrom
//         }).set('Authorization', CurrentToken).expect(401)

//     expect(response.body.message).toBe("you aren't assigned")

// }, 100000)


test('cancel rider return-from-Organization trip in invalid trips', async() => {
    const response = await request(app)
        .post('/api/cancelRiderFrom')
        .send({
            tripid: 1
        }).set('Authorization', CurrentToken).expect(401)

    expect(response.body.message).toBe("No trip found")

}, 100000)

test('Choose from available return-from-organization trips with invalid latest', async() => {

    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidFrom

        }
    });
    const response = await request(app)

    .post('/api/chooseFromReturnTripsApi')
        .send({
            "tripid": tripidFrom,
            "latesttime": "04:10:00"
        }).set('Authorization', CurrentToken).expect(400)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidFrom
        }
    })

    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats)
    expect(response.body.message).toBe("Your location or latest time don't match")

}, 100000)
test('Choose from available return-from-organization trips', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbeforeTrip = await Trips.findOne({
        where: {
            id: tripidFrom

        }
    });
    const response = await request(app)

    .post('/api/chooseFromReturnTripsApi')
        .send({
            "tripid": tripidFrom,
            "latesttime": "05:30:00"
        }).set('Authorization', CurrentToken).expect(200)
    console.log(response.body.message)
    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidFrom
        }
    })

    const resultAfterRequest = await requestRideFrom.findOne({
        where: {
            userid: decoded.id

        },
        order: [
            ['updatedAt', 'DESC']
        ],
    })

    const resultAfterRider = await Rider.findOne({
        where: {
            riderid: decoded.id,
            tofrom: "from",
            tripid: tripidFrom

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    expect(resultAfterRider.dataValues.status).toBe("scheduled")
    expect(resultAfterRequest.dataValues.status).toBe("scheduled")
    expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats + 1)



}, 100000)



test('Search trips', async() => {
    const response = await request(app)
        .post('/api/searchTrip')
        .send({
            "tofrom": "",
            "toorgid": "",
            "fromorgid": "",
            "departuretime": "",
            "arrivaltime": "",
            "ridewith": "",
            "smoking": "",
            "date": "2020-05-27"
        }).set('Authorization', CurrentToken).expect(200)


}, 100000)


test('Search for trips with invalid date', async() => {
    const response = await request(app)
        .post('/api/searchTrip')
        .send({
            "tofrom": "",
            "toorgid": "",
            "fromorgid": "",
            "departuretime": "",
            "arrivaltime": "",
            "ridewith": "",
            "smoking": "",
            "date": "2020-01-29"
        }).set('Authorization', CurrentToken).expect(409)
    expect(response.body.message).toBe("No trips are found")

}, 100000)