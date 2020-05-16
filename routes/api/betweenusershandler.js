const User = require('../../models/users');
const OrgUser = require('../../models/orgusers');
const BetweenUsers = require('../../models/betweenusers');
const Review = require('../../models/reviews')
const Driver = require('../../models/drivers');
const Rider = require('../../models/riders');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
var request = require('request-promise');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret'
const { forEach } = require('p-iteration');
const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

//SignUp (na2es verification by email)
router.post('/', async(req, res) => {
        //Insert users in betweenusers

        const AllUserss = await User.findAll({
            where: { status: 'existing' }
        })

        for (curuser of AllUserss) {
            for (user of AllUserss) {
                if (user.id != curuser.id) {
                    var x = curuser.latitude;
                    var y = curuser.longitude;
                    var z = user.latitude;
                    var w = user.longitude;
                    var body12 = {}
                    var body21 = {}
                    var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z, ',', w, '&destinations=', x, ',', y, '&key=', API_KEY);
                    var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x, ',', y, '&destinations=', z, ',', w, '&key=', API_KEY);
                    const url122 = await request.post(url12).catch(errHandler)
                    body12 = url122;

                    const url211 = await request.post(url21).catch(errHandler)
                    body21 = url211;

                    body12 = JSON.parse(body12)
                    body21 = JSON.parse(body21)
                    var results12 = body12.rows[0].elements;
                    var element12 = results12[0]
                    distance12 = element12.distance.value / 1000;
                    time12 = element12.duration.value / 60;
                    ///////////////////////////////////
                    var results21 = body21.rows[0].elements;
                    var element21 = results21[0]
                    distance21 = element21.distance.value / 1000;
                    time21 = element21.duration.value / 60;
                    const betweenUsersData1 = {
                        user1id: user.id,
                        user2id: curuser.id,
                        distance: distance12,
                        time: time12,
                        trust: 0
                    }
                    const betweenUsersData2 = {
                        user1id: curuser.id,
                        user2id: user.id,
                        distance: distance21,
                        time: time21,
                        trust: 0
                    }
                    await BetweenUsers.create(betweenUsersData1).catch(errHandler);
                    await BetweenUsers.create(betweenUsersData2).catch(errHandler);

                }
            }


        }

    }

);

module.exports = router;