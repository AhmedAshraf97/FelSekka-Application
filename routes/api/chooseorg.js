const OrgUser = require('../../models/orgusers');
const Organization = require('../../models/organizations');
const express = require('express');
const User = require('../../models/users');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const ExpiredToken = require('../../models/expiredtokens');
const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";
var request = require('request-promise');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var userExists = true;

    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized to choose an organization" })
        res.end();
    }
    await ExpiredToken.findOne({ where: { token: req.headers["authorization"] } }).then(expired => {
        if (expired) {
            userExists = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)
    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {

            userExists = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);


    if (userExists) {
        //Organization ID check
        if (req.body.orgid == null) {
            res.status(400).send({ error: "Organization ID", message: "Organization ID paramter is missing" });
        }else if (((req.body.orgid).toString()).trim().length === 0) {
            res.status(400).send({ error: "Organization ID", message: "Organization ID can't be empty" });
        }
        //Email validation 
        if (req.body.email == null) {
            res.status(400).send({ error: "Email", message: "Email paramter is missing" });
        }else if (((req.body.email).toString()).trim().length === 0) {
            res.status(400).send({ error: "Email", message: "Email can't be empty" });
        }else if (!(/^\S+@\S+\.\S+$/.test(req.body.email))) {
            res.status(400).send({ error: "Email", message: "Email address is unvalid" });
        }
        else {
            var domain = true;
            var orglatitude=0;
            var orglongitude = 0;
            await  Organization.findOne({ where: { id: req.body.orgid }}).then(org=>{
                orglatitude = org.latitude;
                orglongitude = org.longitude;
                if( !((req.body.email).includes(org.domain)) ){
                    domain = false;
                }
            }).catch(errHandler);}
            var x = orglatitude;
            var y = orglongitude;
            var z = decoded.latitude;
            var w = decoded.longitude;
            var body12 = {}
            var body21 = {}
            var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z,',',w,'&destinations=',x,',',y,'&key=',API_KEY); 
            var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x,',',y,'&destinations=',z,',',w,'&key=',API_KEY); 
            await request.post(url12).then(function(body) {
                body12 = body;})
            await request.post(url21).then(function(body) {
                body21 = body;})
            body12 = JSON.parse(body12)
            body21 = JSON.parse(body21)
            var results12 = body12.rows[0].elements;
            var element12 = results12[0]
            distance12 = element12.distance.value;
            time12 = element12.duration.value;
            ///////////////////////////////////
            var results21 = body21.rows[0].elements;
            var element21 = results21[0]
            distance21 = element21.distance.value;
            time21 = element21.duration.value;
           
            //Insert org user 
            const orgUserData = {
                orgid: parseInt(req.body.orgid),
                userid: decoded.id,
                distancetoorg: distance12,
                timetoorg: time12,
                distancefromorg:distance21,
                timefromorg: time21,
                status: 'existing'
            }
            if(!domain){
                res.status(200).send({ message: "You can't join this organization" });
            }
            else{
                await OrgUser.create(orgUserData).then(user => {
                    res.status(200).send({ message: "Organization is chosen" });
                }).catch(errHandler);
            }
            
    }
});

module.exports = router;