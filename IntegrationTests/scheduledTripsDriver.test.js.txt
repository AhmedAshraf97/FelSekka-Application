const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const offerRideFrom = require('../models/offerridefrom');
const offerRideTo = require('../models/offerrideto');
const requestRideFrom = require('../models/requestridefrom');
const requestRideTo = require('../models/requestrideto');
const Trips = require('../models/trips')
const Driver = require('../models/drivers');
const Rider = require('../models/riders');

var tripidTo = 0
var tripidFrom = 0;
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
var CurrentToken = 0;
test('Signing in with driver', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "nouran.magdy@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken = response.body.token

}, 100000)

test('Cancel to-organization trip driver', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Driver.findOne({
        where: {
            driverid: decoded.id,
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

    .post('/api/canceldriverTo')
        .send({
            "tripid": tripidTo,
        }).set('Authorization', CurrentToken).expect(200)

    const resultAfterDriver = await Driver.findOne({
        where: {
            driverid: decoded.id,
            tofrom: "to",
            tripid: tripidTo

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidTo
        }
    })

    const resultAfteroffer = await offerRideTo.findOne({
        where: {
            id: resultAfterDriver.offerid
        }
    })

    const resultAfterRider = await Rider.findOne({
        where: {

            tofrom: "to",
            tripid: tripidTo

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    const resultAfterRequest = await requestRideTo.findOne({
        where: {
            id: resultAfterRider.dataValues.requestid
        }
    })
    expect(resultAfterRider.dataValues.status).toBe("cancelled")
    expect(resultAfterRequest.dataValues.status).toBe("cancelled")

    expect(resultAfterDriver.dataValues.status).toBe("cancelled")
    expect(resultAfteroffer.dataValues.status).toBe("cancelled")
    expect(resultAfterTrip.dataValues.status).not.toBe(resultbeforeTrip.dataValues.status)


}, 100000)



test('cancel driver To-Organization trip with invalid trip id', async() => {

    const response = await request(app)
        .post('/api/canceldriverTo')
        .send({
            tripid: 1
        }).set('Authorization', CurrentToken).expect(400)
    expect(response.body.message).toBe("enter valid trip id")


}, 100000)

test('cancel driver To-Organization trip with another driver id', async() => {
    const randomTrip = await Trips.findOne({
        where: {
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    const response = await request(app)
        .post('/api/canceldriverTo')
        .send({
            tripid: randomTrip.id
        }).set('Authorization', CurrentToken).expect(400)
    expect(response.body.message).toBe("You aren't the driver")


}, 100000)



test('Cancel return-from-organization trip driver', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await Driver.findOne({
        where: {
            driverid: decoded.id,
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

    .post('/api/canceldriverFrom')
        .send({
            "tripid": tripidFrom,
        }).set('Authorization', CurrentToken).expect(200)

    const resultAfterDriver = await Driver.findOne({
        where: {
            driverid: decoded.id,
            tofrom: "from",
            tripid: tripidFrom

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    const resultAfterTrip = await Trips.findOne({
        where: {
            id: tripidFrom
        }
    })

    const resultAfteroffer = await offerRideFrom.findOne({
        where: {
            id: resultAfterDriver.offerid
        }
    })

    const resultAfterRider = await Rider.findOne({
        where: {

            tofrom: "from",
            tripid: tripidFrom

        },
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    const resultAfterRequest = await requestRideFrom.findOne({
        where: {
            id: resultAfterRider.dataValues.requestid
        }
    })
    expect(resultAfterRider.dataValues.status).toBe("cancelled")
    expect(resultAfterRequest.dataValues.status).toBe("cancelled")

    expect(resultAfterDriver.dataValues.status).toBe("cancelled")
    expect(resultAfteroffer.dataValues.status).toBe("cancelled")
    expect(resultAfterTrip.dataValues.status).not.toBe(resultbeforeTrip.dataValues.status)


}, 100000)



test('cancel driver To-Organization trip with invalid trip id', async() => {

    const response = await request(app)
        .post('/api/canceldriverFrom')
        .send({
            tripid: 1
        }).set('Authorization', CurrentToken).expect(400)
    expect(response.body.message).toBe("enter valid trip id")


}, 100000)

test('cancel driver To-Organization trip with another driver id', async() => {
    const randomTrip = await Trips.findOne({
        where: {
            status: "scheduled"
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    const response = await request(app)
        .post('/api/canceldriverFrom')
        .send({
            tripid: randomTrip.id
        }).set('Authorization', CurrentToken).expect(400)
    expect(response.body.message).toBe("you aren't the driver")


}, 100000)