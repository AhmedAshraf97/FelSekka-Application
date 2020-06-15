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
test('Signing in with invalid password', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "nadineshawkat@live.com",
            "password": "12345n"
        }).expect(401)


})
test('Signing in with incorrect email', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "nadineshawk@live.com",
            "password": "12345n"
        }).expect(400)



})

test('Signing in with empty email', async() => {
    const response = await request(app)
        .post('/api/signin')
        .send({
            "EmailOrPhone": "",
            "password": "12345n"
        }).expect(400)


})