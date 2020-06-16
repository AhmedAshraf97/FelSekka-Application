const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const requestRideFrom = require('../models/requestridefrom');
const requestRideTo = require('../models/requestrideto');
const offerRideFrom = require('../models/offerridefrom');
const offerRideTo = require('../models/offerrideto');


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

})

test('Scheduled trips', async() => {
    const response = await request(app)
        .post('/api/scheduledtrips')
        .set('Authorization', CurrentToken).expect(200)
        // console.log(JSON.stringify(response.body))

})


test('offer to-organization trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/offerrideto')
        .send({

            "carid": 40,
            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",
            "date": "2021-06-15",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("Offer is made successfully")

    const resultafter = await offerRideTo.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    offerToId = resultafter.dataValues.id

})

test('offer to-organization trip at the same time', async() => {
    const response = await request(app)
        .post('/api/offerrideto')
        .send({

            "carid": 40,
            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",
            "date": "2021-06-15",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You can't offer two rides at the same time")
        //console.log(JSON.stringify(response.body))

})


test('offer to-organization trip with invalid organization', async() => {
    const response = await request(app)
        .post('/api/offerrideto')
        .send({

            "carid": 40,
            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",
            "date": "2021-06-16",
            "toorgid": 10,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You are not assigned to this organization")
        //console.log(JSON.stringify(response.body))

})



test('offer to-organization trip with empty number of seats', async() => {
    const response = await request(app)
        .post('/api/offerrideto')
        .send({

            "carid": 40,
            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",
            "date": "2021-06-16",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": ""
        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("Number of seats can't be empty")


})


test('offer to-organization trip with invalid earliest trip start time', async() => {
    const response = await request(app)
        .post('/api/offerrideto')
        .send({

            "carid": 40,
            "earliesttime": "05:00:00",
            "arrivaltime": "04:00:00",
            "date": "2021-06-16",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("Arrival time can't be before earliest time")


})

//OFFER FROM

test('offer return-from-organization trip', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/offerridefrom')
        .send({

            "carid": 40,
            "latesttime": "04:00:00",
            departuretime: "01:00:00",
            "date": "2021-06-20",
            "fromorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("Offer is made successfully")

    const resultafter = await offerRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    offerFromId = resultafter.dataValues.id


})

test('offer return-from-organization trip at the same time', async() => {
    const response = await request(app)
        .post('/api/offerridefrom')
        .send({

            "carid": 40,
            "latesttime": "04:00:00",
            departuretime: "01:00:00",
            "date": "2021-06-20",
            "fromorgid": 9,
            "ridewith": "female",
            "smoking": "no",
            "numberofseats": 4
        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You can't offer two rides at the same time")


})


test('request to-organization trip ', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/requestrideto')
        .send({

            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",

            "date": "2021-06-27",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("Request is made successfully")
    const resultafter = await requestRideTo.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    requestToId = resultafter.dataValues.id

})


test('request to-organization trip at the same time', async() => {
    const response = await request(app)
        .post('/api/requestrideto')
        .send({

            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",

            "date": "2021-06-27",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You can't request two rides at the same time")


})


test('request to-organization trip with invalid organization', async() => {
    const response = await request(app)
        .post('/api/requestrideto')
        .send({

            "earliesttime": "01:00:00",
            "arrivaltime": "04:00:00",

            "date": "2021-06-27",
            "toorgid": 10,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You aren't assigned to this organization")
        //console.log(JSON.stringify(response.body))

})





////////////////////////////////////

test('request to-organization trip with invalid earliest pick-up time', async() => {
    const response = await request(app)
        .post('/api/requestrideto')
        .send({

            "earliesttime": "05:00:00",
            "arrivaltime": "04:00:00",

            "date": "2021-06-27",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("Arrival time can't be before earliest time")


})







test('request return-from-organization trip ', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    const response = await request(app)

    .post('/api/requestridefrom')
        .send({

            "latesttime": "07:00:00",
            "departuretime": "05:00:00",

            "date": "2021-06-27",
            "fromorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("Request is made successfully")
    const resultafter = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    expect(resultbefore.dataValues.id).not.toBe(resultafter.dataValues.id)
    requestFromId = resultafter.dataValues.id

})



test('request to-organization trip at the same time', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    const response = await request(app)

    .post('/api/requestridefrom')
        .send({

            "latesttime": "07:00:00",
            "departuretime": "05:00:00",

            "date": "2021-06-27",
            "fromorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You can't request two rides at the same time")
    const resultafter = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    expect(resultbefore.dataValues.id).toBe(resultafter.dataValues.id)


})


test('request to-organization trip with invalid organization', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const resultbefore = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    const response = await request(app)

    .post('/api/requestridefrom')
        .send({

            "latesttime": "07:00:00",
            "departuretime": "05:00:00",

            "date": "2021-06-28",
            "fromorgid": 10,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("You aren't assigned to this organization")
    const resultafter = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });

    expect(resultbefore.dataValues.id).toBe(resultafter.dataValues.id)


})

test('cancel to-organization offer', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/cancelOffer')
        .send({

            "tofrom": "to",
            "offerid": offerToId


        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("The offer is cancelled")
    const resultafter = await offerRideTo.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    expect(resultafter.dataValues.status).toBe("cancelled")

})
test('cancel from-organization offer', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/cancelOffer')
        .send({

            "tofrom": "from",
            "offerid": offerFromId


        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("The offer is cancelled")
    const resultafter = await offerRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    expect(resultafter.dataValues.status).toBe("cancelled")

})

test('cancel to-organization request', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/cancelRequest')
        .send({

            "tofrom": "to",
            "requestid": requestToId


        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("The Request is cancelled")
    const resultafter = await requestRideTo.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    expect(resultafter.dataValues.status).toBe("cancelled")

})


test('cancel from-organization request', async() => {
    var decoded = jwt.verify(CurrentToken, process.env.SECRET_KEY)
    const response = await request(app)
        .post('/api/cancelRequest')
        .send({

            "tofrom": "from",
            "requestid": requestFromId


        })
        .set('Authorization', CurrentToken).expect(200)

    expect(response.body.message).toBe("The Request is cancelled")
    const resultafter = await requestRideFrom.findOne({
        where: {
            userid: decoded.id,
        },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    expect(resultafter.dataValues.status).toBe("cancelled")

})