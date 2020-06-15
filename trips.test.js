const request = require("supertest")
const express = require('express');
const app = require('./index');
const dbConnection = require('./database/connection')

var CurrentToken = 0;

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


// test('offer to-organization trip', async() => {
//     const response = await request(app)
//         .post('/api/offerrideto')
//         .send({

//             "carid": 40,
//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",
//             "date": "2020-06-15",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(200)

//     expect(response.body.message).toBe("Offer is made successfully")

// })

// test('offer to-organization trip at the same time', async() => {
//     const response = await request(app)
//         .post('/api/offerrideto')
//         .send({

//             "carid": 40,
//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",
//             "date": "2020-06-15",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You can't offer two rides at the same time")
//         //console.log(JSON.stringify(response.body))

// })


// test('offer to-organization trip with invalid organization', async() => {
//     const response = await request(app)
//         .post('/api/offerrideto')
//         .send({

//             "carid": 40,
//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",
//             "date": "2020-06-16",
//             "toorgid": 10,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You are not assigned to this organization")
//         //console.log(JSON.stringify(response.body))

// })



// test('offer to-organization trip with empty number of seats', async() => {
//     const response = await request(app)
//         .post('/api/offerrideto')
//         .send({

//             "carid": 40,
//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",
//             "date": "2020-06-16",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": ""
//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("Number of seats can't be empty")


// })


// test('offer to-organization trip with invalid earliest trip start time', async() => {
//     const response = await request(app)
//         .post('/api/offerrideto')
//         .send({

//             "carid": 40,
//             "earliesttime": "05:00:00",
//             "arrivaltime": "04:00:00",
//             "date": "2020-06-16",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("Arrival time can't be before earliest time")


// })

////OFFER FROM

// test('offer return-from-organization trip', async() => {
//     const response = await request(app)
//         .post('/api/offerridefrom')
//         .send({

//             "carid": 40,
//             "latesttime": "04:00:00",
//             departuretime: "01:00:00",
//             "date": "2020-06-20",
//             "fromorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(200)

//     expect(response.body.message).toBe("Offer is made successfully")

// })

// test('offer return-from-organization trip at the same time', async() => {
//     const response = await request(app)
//         .post('/api/offerridefrom')
//         .send({

//             "carid": 40,
//             "latesttime": "04:00:00",
//             departuretime: "01:00:00",
//             "date": "2020-06-20",
//             "fromorgid": 9,
//             "ridewith": "female",
//             "smoking": "no",
//             "numberofseats": 4
//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You can't offer two rides at the same time")


// })


// test('request to-organization trip ', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(200)

//     expect(response.body.message).toBe("Request is made successfully")


// })


// test('request to-organization trip at the same time', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You can't request two rides at the same time")


// })


// test('request to-organization trip with invalid organization', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 10,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You aren't assigned to this organization")
//         //console.log(JSON.stringify(response.body))

// })





//////////////////////////////////////

test('request to-organization trip with invalid earliest pick-up time', async() => {
    const response = await request(app)
        .post('/api/requestrideto')
        .send({

            "earliesttime": "05:00:00",
            "arrivaltime": "04:00:00",

            "date": "2020-06-27",
            "toorgid": 9,
            "ridewith": "female",
            "smoking": "no"

        })
        .set('Authorization', CurrentToken).expect(400)

    expect(response.body.message).toBe("Arrival time can't be before earliest time")


})







// test('request to-organization trip ', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(200)

//     expect(response.body.message).toBe("Request is made successfully")


// })


// test('request to-organization trip at the same time', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 9,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You can't request two rides at the same time")


// })


// test('request to-organization trip with invalid organization', async() => {
//     const response = await request(app)
//         .post('/api/requestrideto')
//         .send({

//             "earliesttime": "01:00:00",
//             "arrivaltime": "04:00:00",

//             "date": "2020-06-27",
//             "toorgid": 10,
//             "ridewith": "female",
//             "smoking": "no"

//         })
//         .set('Authorization', CurrentToken).expect(400)

//     expect(response.body.message).toBe("You aren't assigned to this organization")
//         //console.log(JSON.stringify(response.body))

// })