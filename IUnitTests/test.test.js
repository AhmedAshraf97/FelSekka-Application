const request = require("supertest")
const express = require('express');
const app = require('../index');

var validationcar = require('../routes/api/add_car').validation;
var validationAccOrg = require('../routes/api/acceptorg').validation;
var validationRating = require('../routes/api/add_rating').validation;


var validationAccOrg = require('../routes/api/acceptorg').validation
var validationUpdateTrust = require('../routes/api/updatetrust').validation;

var validationStartRiderTripTo = require('../routes/api/startRiderTripTo').validation
var validationStartDriverTripTo = require('../routes/api/startDriverTripTo').validation
var validationStartRiderTripFrom = require('../routes/api/startRiderTripFrom').validation
var validationStartDriverTripFrom = require('../routes/api/startDriverTripFrom').validation
var validationSignUp = require('../routes/api/sign_up').validation





test('valid sign up', async() => {
    var result = validationSignUp(
        "Menna",
        "Fawzy",
        "ahmed",
        "mennafawzy@live.com",
        "01112223333",
        "12345n67-",
        "12345n67-",
        "male",
        "2020-01-01",
        "female",
        "no",
        "31.29217160",
        "29.96108870"
    )
    console.log(result.message)
    expect(result.validChecks).toBe(true)

})


test('valid start rider trip from', async() => {
    var result = validationStartRiderTripFrom("1", "1", "09:25:25")
    expect(result.validChecks).toBe(true)
})

test('valid start driver trip to', async() => {
    var result = validationStartDriverTripTo("1", "09:25:25", "30.22", "30.111")
    expect(result.validChecks).toBe(true)
})

test('valid start driver trip from', async() => {
    var result = validationStartDriverTripFrom("1", "09:25:25", "30.22", "30.111")
    expect(result.validChecks).toBe(true)
})

test('valid trust update', async() => {
    var result = validationUpdateTrust("1", "1")
    expect(result.validChecks).toBe(true)
})

test('invalid year of the car', async() => {
    var result = validationcar("Mercedes", "benzema", "benzema", "Sedan", "123", "458",
        "21515151", "Ew3a", "Eltayara", "Ew3a", "Eltayara", "Fo7lo2y", "4")

    expect(result.validChecks).toBe(false)
}, 100000)

test('invalid organization id', async() => {


    var result = validationAccOrg("farah")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Organization ID must be a number")
}, 100000)


test('invalid rating', async() => {


    var result = validationRating("20", "2020-05-27 23:04:18")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Rating should be a number of value (1-5)")
}, 100000)