const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
process.env.SECRET_KEY = 'secret';
const jwt = require('jsonwebtoken');

var CurrentToken = 0;
var tripid = 5999
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


test('Driver starts trip from', async() => {
    const response = await request(app)
        .post('/api/startDriverTripFrom')
        .send({
            "tripid": tripid,
            "actualpickuptime": "01:00:00",
            "latitude": "30.08291800",
            "longitude": "31.32745330"
        }).set('Authorization', CurrentToken).expect(200)


}, 100000)

test('Rider1 starts trip from', async() => {
    const response = await request(app)
        .post('/api/startRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualpickuptime": "01:00:00",
            "riderid": 122
        }).expect(200)
}, 100000)

test('Rider2 starts trip  from', async() => {
    const response = await request(app)
        .post('/api/startRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualpickuptime": "01:00:00",
            "riderid": 124
        }).expect(200)

}, 100000)

test('Rider3 starts trip  from', async() => {
    const response = await request(app)
        .post('/api/startRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualpickuptime": "01:00:00",
            "riderid": 104
        }).expect(200)

}, 100000)


test('Rider1 ends trip  from', async() => {
    const response = await request(app)
        .post('/api/endRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualarrivaltime": "01:20:00",
            "riderid": 122,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)

test('Rider2 ends trip  from', async() => {
    const response = await request(app)
        .post('/api/endRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualarrivaltime": "01:40:00",
            "riderid": 124,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)



test('Rider3 ends trip  from', async() => {
    const response = await request(app)
        .post('/api/endRiderTripFrom')
        .send({
            "driverid": "110",
            "tripid": tripid,
            "actualarrivaltime": "02:00:00",
            "riderid": 104,
            "distance": "9.5",
            "time": "29"
        }).expect(200)

}, 100000)


test('Driver ends trip  from', async() => {
    const response = await request(app)
        .post('/api/endDriverTripFrom')
        .send({
            "tripid": tripid,
            "actualarrivaltime": "03:00:00",
            "distance": "18",
            "time": "30",
            "latitude": "30.08291800",
            "longitude": "31.32745330"
        }).set('Authorization', CurrentToken).expect(200)

}, 100000)