const request = require("supertest")
const express = require('express');
const app = require('../index');




test('valid trust update', async() => {
    const response = await request(app)
        .post('/api/test1')
        .send({
            userid: "1",
            trust: "1"
        }).expect(200)

    console.log(response.body)
    expect(response.body).toBe(true)
})