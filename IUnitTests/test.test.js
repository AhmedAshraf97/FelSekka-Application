const request = require("supertest")
const express = require('express');
const app = require('../index');

var validationcar = require('../routes/api/add_car').validation;
var validationAccOrg = require('../routes/api/acceptorg').validation;
var validationRating = require('../routes/api/add_rating').validation;


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


    var result = validationRating("20", "2020-05-27")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Rating should be a number of value (1-5)")
}, 100000)