const request = require("supertest")
const express = require('express');
const app = require('../index');

var validationcar = require('../routes/api/add_car').validation;
var validationAccOrg = require('../routes/api/acceptorg').validation;

// test('valid trust update', async() => {
//     const response = await request(app)
//         .post('/api/test1')
//         .send({
//             userid: "1",
//             trust: "1"
//         }).expect(200)

//     console.log(response.body)
//     expect(response.body).toBe(true)
// })

test('valid accept organization', async() => {


    var result = validationcar("Mercedes", "benzema", "benzema", "Sedan", "123", "458",
        "21515151", "Ew3a", "Eltayara", "Ew3a", "Eltayara", "Fo7lo2y", "4")

    expect(result.validChecks).toBe(false)
}, 100000)

test('valid add car', async() => {


    var result = validationAccOrg("farah")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Organization ID must be a number")
}, 100000)