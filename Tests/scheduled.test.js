const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const requestRideFrom = require('../models/requestridefrom');
const requestRideTo = require('../models/requestrideto');
const offerRideFrom = require('../models/offerridefrom');
const offerRideTo = require('../models/offerrideto');

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

test('matching', async() => {
    const response = await request(app)
        .post('/api/matching')
        .expect(200)
    expect(response.body.message).toBe("Matching Done")

})

test('matching with no offers', async() => {
    const response = await request(app)
        .post('/api/matching')
        .expect(400)
    expect(response.body.message).toBe("No trips to be scheduled")

})