const request = require("supertest")
const express = require('express');
const app = require('../index');
const dbConnection = require('../database/connection')
const User = require('../models/users');
const Org = require('../models/organizations');
const OrgUser = require('../models/orgusers');
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


//Add org, show pending org ,Accept Org by admin, choose , show existing org  , delete Org

//Add Org
test('Add Org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const oldOrgCount = await Org.count({
        where: {
            status: "pending"
        }
    })

    const response = await request(app)
        .post('/api/addorg')
        .send({
            name: "Ahmed University In Egypt",
            longitude: "30.3030",
            latitude: "31.3131",
            domain: "@ahmed.com"
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)


    const newOrgCount = await Org.count({
        where: {
            status: "pending"
        }
    })
    expect(newOrgCount - oldOrgCount).toBe(1)

}, 10000)


//Show pending org
test('Show Pending Org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/showpendingorg')
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

})


//Accept Organization
test('Accept Organization ', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const oldOrgCount = await Org.count({
        where: {
            status: "existing"
        }
    })

    const Org1 = await Org.findOne({
        where: {
            domain: "@ahmed.com"
        }
    })
    const response = await request(app)
        .post('/api/acceptorg')
        .send({
            "orgid": Org1.id
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)



    const newOrgCount = await Org.count({
        where: {
            status: "existing"
        }
    })
    expect(newOrgCount - oldOrgCount).toBe(1)

})









//Choose org
test('Choose Org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })



    const Org1 = await Org.findOne({
        where: {
            domain: "@ahmed.com"
        }
    })

    const response = await request(app)
        .post('/api/chooseorg').send({
            orgid: Org1.id,
            email: "Nouran@ahmed.com"
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

})



//Show existing org
test('Show Existing Org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })

    const response = await request(app)
        .post('/api/showexistingorg')
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

})

//Delete Org
test('Delete Org', async() => {

    const user = await User.findOne({
        where: {
            email: "nouran.magdy@live.com",
            status: 'existing'
        }
    })
    const Org1 = await Org.findOne({
        where: {
            domain: "@ahmed.com"
        }
    })

    const response = await request(app)
        .post('/api/deleteorg')
        .send({
            "orgid": Org1.id
        })
        .set('Authorization', jwt.sign(user.dataValues, process.env.SECRET_KEY))
        .expect(200)

    const orgus = await OrgUser.findOne({
        where: {
            userid: user.id,
            orgid: Org1.id
        }
    })

    expect(orgus.status).toBe("cancelled");

})