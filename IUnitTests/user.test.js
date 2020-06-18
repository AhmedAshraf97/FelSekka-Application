const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const User = require('../models/users');
const Car = require('../models/cars');
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

// test('Signing in', async() => {
//     const response = await request(app)
//         .post('/api/signin')
//         .send({
//             "EmailOrPhone": "nadineshawkat@live.com",
//             "password": "12345n67-"
//         }).expect(200)
//     CurrentToken = response.body.token


// })

test('Signing up with empty paramters', async() => {
    const response = await request(app)
        .post('/api/signup')
        .send({
            "firstname": "",
            "lastname": "Signup",
            "username": "testsignup2",
            "email": "testsignup2@live.com",
            "phonenumber": "01005584641",
            "latitude": 30.303030,
            "longitude": 31.313131,
            "password": "12345n67-",
            "confirmpassword": "12345n67-",
            "gender": "male",
            "birthdate": "1970-01-01",
            "ridewith": "male",
            "smoking": "no"
        }).expect(400)


})


test('Signing up with invalid data type', async() => {
    const response = await request(app)
        .post('/api/signup')
        .send({
            "firstname": "test",
            "lastname": 12,
            "username": "testsignup2",
            "email": "testsignup2@live.com",
            "phonenumber": "01005584641",
            "latitude": 30.303030,
            "longitude": 31.313131,
            "password": "12345n67-",
            "confirmpassword": "12345n67-",
            "gender": "male",
            "birthdate": "1970-01-01",
            "ridewith": "male",
            "smoking": "no"
        }).expect(400)


})

test('Signing up with invalid email format', async() => {
    const response = await request(app)
        .post('/api/signup')
        .send({
            "firstname": "test",
            "lastname": "Signup",
            "username": "testsignup2",
            "email": "testsignup2",
            "phonenumber": "01005584641",
            "latitude": 30.303030,
            "longitude": 31.313131,
            "password": "12345n67-",
            "confirmpassword": "12345n67-",
            "gender": "male",
            "birthdate": "1970-01-01",
            "ridewith": "male",
            "smoking": "no"
        }).expect(400)


})

test('Signing up with unmatched password', async() => {
    const response = await request(app)
        .post('/api/signup')
        .send({
            "firstname": "test",
            "lastname": "Signup",
            "username": "testsignup2",
            "email": "testsignup2@live.com",
            "phonenumber": "01005584641",
            "latitude": 30.303030,
            "longitude": 31.313131,
            "password": "12345n67-",
            "confirmpassword": "1234",
            "gender": "male",
            "birthdate": "1970-01-01",
            "ridewith": "male",
            "smoking": "no"
        }).expect(400)


})