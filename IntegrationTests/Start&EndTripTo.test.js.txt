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
process.env.SECRET_KEY = 'secret';
const jwt = require('jsonwebtoken');

var CurrentToken = 0;
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
            "EmailOrPhone": "moazalaa@live.com",
            "password": "12345n67-"
        }).expect(200)
    CurrentToken = response.body.token

}, 100000)


test('Driver starts trip to', async() => {
    const response = await request(app)
        .post('/api/startDriverTripTo')
        .send({
            "tripid": 5839,
            "actualpickuptime": "01:12:00",
            "latitude": "30.08291800",
            "longitude": "31.32745330"
        }).set('Authorization', CurrentToken).expect(200)


}, 100000)

test('Rider1 starts trip to', async() => {
    const response = await request(app)
        .post('/api/startRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualpickuptime": "01:17:00",
            "riderid": 122
        }).expect(200)
}, 100000)

test('Rider2 starts trip to', async() => {
    const response = await request(app)
        .post('/api/startRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualpickuptime": "01:22:00",
            "riderid": 124
        }).expect(200)

}, 100000)

test('Rider3 starts trip to', async() => {
    const response = await request(app)
        .post('/api/startRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualpickuptime": "01:29:00",
            "riderid": 104
        }).expect(200)

}, 100000)

test('Driver ends trip to', async() => {
    const response = await request(app)
        .post('/api/endDriverTripTo')
        .send({
            "tripid": 5839,
            "actualarrivaltime": "03:00:00",
            "distance": "18",
            "time": "30",
            "latitude": "30.08291800",
            "longitude": "31.32745330"
        }).set('Authorization', CurrentToken).expect(200)

}, 100000)

test('Rider1 ends trip to', async() => {
    const response = await request(app)
        .post('/api/endRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualarrivaltime": "03:00:00",
            "riderid": 122,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)

test('Rider2 ends trip to', async() => {
    const response = await request(app)
        .post('/api/endRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualarrivaltime": "03:00:00",
            "riderid": 124,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)



test('Rider3 ends trip to', async() => {
    const response = await request(app)
        .post('/api/endRiderTripTo')
        .send({
            "driverid": "110",
            "tripid": 5839,
            "actualarrivaltime": "03:00:00",
            "riderid": 104,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)