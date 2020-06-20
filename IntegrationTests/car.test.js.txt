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


//Add car, Edit car, Add Org, Edit Org

// //Add Car
test('Add Car', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/addcar')
        .send({
            "brand": "Mercedes",
            "model": "benzema",
            "year": "2015",
            "type": "Sedan",
            "plateletters": "ا و ع",
            "platenumbers": "458",
            "nationalid": "21515151",
            "carlicensefront": "Ew3a",
            "carlicenseback": "Eltayara",
            "driverlicensefront": "Ew3a",
            "driverlicenseback": "Eltayara",
            "color": "Fo7lo2y",
            "numberofseats": "4"
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

}, 10000)


//Edit Car
test('Edit Car', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const Car1 = await Car.findOne({
        where: {
            userid: user.id,
            "plateletters": "ا و ع",
            "platenumbers": "458",
            status: "existing"
        }
    }, 10000)

    const response = await request(app)
        .post('/api/editcar')
        .send({
            "carid": Car1.id,
               "brand": "",
            "model": "",
            "year": "",
            "type": "",
            "plateletters": "",
            "platenumbers": "",
            "nationalid": "",
            "carlicensefront": "",
            "carlicenseback": "",
            "driverlicensefront": "",
            "driverlicenseback": "",
            "color": "",
            "numberofseats": "5"
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

    // console.log(response.body.message)

    const Car2 = await Car.findOne({
        where: {
            userid: user.id,
            "plateletters": "ا و ع",
            "platenumbers": "458",
            status: "existing"
        }
    })

    await expect(Car2.numberofseats).toBe(5)


})


//Edit Car
test('Edit Car without giving parameters ', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const Car1 = await Car.findOne({
        where: {
            userid: user.id,
            "plateletters": "ا و ع",
            "platenumbers": "458",
            status: "existing"
        }
    }, 10000)

    const response = await request(app)
        .post('/api/editcar')
        .send({
            "carid": Car1.id,
            "brand": "",
            "model": "",
            "year": "",
            "type": "",
            "plateletters": "",
            "platenumbers": "",
            "nationalid": "",
            "carlicensefront": "",
            "carlicenseback": "",
            "driverlicensefront": "",
            "driverlicenseback": "",
            "color": "",
            "numberofseats": ""
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(404)
    await expect(response.body.message).toBe("No parameters to be edited")


})



//Delete Car
test('Delete Car', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const Car1 = await Car.findOne({
        where: {
            userid: user.id,
            "plateletters": "ا و ع",
            "platenumbers": "458",
            status: "existing"
        }
    })
    const response = await request(app)
        .post('/api/deletecar')
        .send({
            "carid": Car1.id
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

    const Car2 = await Car.findOne({
        where: {
            userid: user.id,
            "plateletters": "ا و ع",
            "platenumbers": "458",
            status: "existing"
        }
    })
    expect(Car2).toBeNull();

})