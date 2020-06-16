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
var CurrentToken = 0;
var offerToId = 0
var offerFromId = 0
var requestToId = 0
var requestFromId = 0

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

// test('Scheduled trips', async() => {
//     const response = await request(app)
//         .post('/api/scheduledtrips')
//         .set('Authorization', CurrentToken).expect(200)
//         // console.log(JSON.stringify(response.body))

// }, 100000)

// test('cancel rider To-Organization trip', async() => {
//     var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
//     const resultbefore = await Rider.findOne({
//         where: {
//             riderid: decoded.id,
//             tofrom: "to"
//         },
//         order: [
//             ['createdAt', 'DESC']
//         ],
//     });

//     const resultbeforeTrip = await Trips.findOne({
//         where: {
//             id: resultbefore.tripid

//         }
//     });

//     const response = await request(app)
//         .post('/api/cancelRiderTo')
//         .send({
//             tripid: resultbefore.tripid
//         }).set('Authorization', CurrentToken).expect(200)


//     const resultAfterRider = await Rider.findOne({
//         where: {
//             riderid: decoded.id,
//             tofrom: "to",
//             tripid: resultbefore.dataValues.tripid

//         },
//         order: [
//             ['createdAt', 'DESC']
//         ],
//     });

//     const resultAfterTrip = await Trips.findOne({
//         where: {
//             id: resultbefore.dataValues.tripid
//         }
//     })

//     const resultAfterRequest = await requestRideTo.findOne({
//         where: {
//             id: resultbefore.dataValues.requestid
//         }
//     })

//     expect(resultAfterRider.dataValues.status).toBe("cancelled")
//     expect(resultAfterRequest.dataValues.status).toBe("cancelled")
//     expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats - 1)

// }, 100000)


// test('cancel rider From-Organization trip', async() => {
//     var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
//     const resultbefore = await Rider.findOne({
//         where: {
//             riderid: decoded.id,
//             tofrom: "from"
//         },
//         order: [
//             ['createdAt', 'DESC']
//         ],
//     });

//     const resultbeforeTrip = await Trips.findOne({
//         where: {
//             id: resultbefore.tripid

//         }
//     });

//     const response = await request(app)
//         .post('/api/cancelRiderFrom')
//         .send({
//             tripid: resultbefore.tripid
//         }).set('Authorization', CurrentToken).expect(200)


//     const resultAfterRider = await Rider.findOne({
//         where: {
//             riderid: decoded.id,
//             tofrom: "from",
//             tripid: resultbefore.dataValues.tripid

//         },
//         order: [
//             ['createdAt', 'DESC']
//         ],
//     });

//     const resultAfterTrip = await Trips.findOne({
//         where: {
//             id: resultbefore.dataValues.tripid
//         }
//     })

//     const resultAfterRequest = await requestRideFrom.findOne({
//         where: {
//             id: resultbefore.dataValues.requestid
//         }
//     })

//     expect(resultAfterRider.dataValues.status).toBe("cancelled")
//     expect(resultAfterRequest.dataValues.status).toBe("cancelled")
//     expect(resultAfterTrip.dataValues.numberofseats).toBe(resultbeforeTrip.dataValues.numberofseats - 1)

// }, 100000)