const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const User = require('../models/users');
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


test('Signing up', async() => {
    const response = await request(app)
        .post('/api/signup')
        .send({
            "firstname": "Test",
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
        }).expect(200)

})


test('show profile', async() => {
    const user = await User.findOne({
        where: {
            email: "testsignup2@live.com",
            status: 'existing'
        }
    })
    const response = await request(app)
        .post('/api/showprofile')
        .send({
            username: user.username
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

    expect(JSON.stringify(response.body)).not.toBeNull();
})


test('Show my cars', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/showmycars')
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(JSON.stringify(response.body)).not.toBeNull();

})


test('Show my org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/showmyorg')
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(JSON.stringify(response.body)).not.toBeNull();

})


test('Edit profile', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/editprofile').send({
            firstname: "nourann"
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(response.body.message).toBe("OK");

})


test('Update trust', async() => {

    const user1 = await User.findOne({
        where: {
            email: "salmaadel@live.com",
            status: 'existing'
        }
    })
    const user2 = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/updatetrust').send({
            userid: user2.id,
            trust: 1
        })
        .set('Authorization', jwt.sign(user1.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(response.body.message).toBe("Trust updated");

})


test('Show people i trust', async() => {

    const user1 = await User.findOne({
        where: {
            email: "salmaadel@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/peopleItrust')
        .set('Authorization', jwt.sign(user1.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(JSON.stringify(response.body)).not.toBeNull();


})


test('Show people that trust me', async() => {

    const user2 = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/peopleItrust')
        .set('Authorization', jwt.sign(user2.dataValues, process.env.SECRET_KEY))
        .expect(200)
    expect(JSON.stringify(response.body)).not.toBeNull();


})

test('delete account', async() => {
    const user = await User.findOne({
        where: {
            email: "testsignup2@live.com",
            status: 'existing'
        }
    })
    const response = await request(app)
        .post('/api/deleteaccount')
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

    const userafterdeletion = await User.findOne({
        where: {
            email: "testsignup2@live.com",
            status: 'unavailable'
        }
    })
    expect(userafterdeletion).not.toBeNull();

})