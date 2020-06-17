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
var CurrentToken2 = 0;
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

test('Signing in with driver', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "ismailhossam@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken = response.body.token

}, 100000)

test('show past trips for driver', async() => {

    const response = await request(app)
        .post('/api/showpasttrips')
        .set('Authorization', CurrentToken).expect(200)


}, 100000)


test('Signing in with rider', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "mohamedhafez@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken2 = response.body.token

}, 100000)

test('show past trips for driver', async() => {

    const response = await request(app)
        .post('/api/showpasttrips')
        .set('Authorization', CurrentToken2).expect(200)


}, 100000)

test('Signing in with rider', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "nadineshawkat@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken2 = response.body.token

}, 100000)

test('show past trips for driver', async() => {

    const response = await request(app)
        .post('/api/showpasttrips')
        .set('Authorization', CurrentToken2).expect(409)


}, 100000)