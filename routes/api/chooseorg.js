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

function validation(orgid, email) {
    var validChecks = true;
    var message = ""
    if (orgid == null) {
        validChecks = false;
        message = { error: "Organization ID", message: "Organization ID parameter is missing" }
    } else if (((orgid).toString()).trim().length === 0) {
        validChecks = false;
        message = { error: "Organization ID", message: "Organization ID can't be empty" }
    }
    if (email == null) {
        validChecks = false;
        message = { error: "Email", message: "Email parameter is missing" }
    } else if (((email).toString()).trim().length === 0) {
        validChecks = false;
        message = { error: "Email", message: "Email can't be empty" }
    } else if (!(/^\S+@\S+\.\S+$/.test(email))) {
        validChecks = false;
        message = { error: "Email", message: "Email address is unvalid" }
    }
    return { validChecks: validChecks, message: message }
}
router.post('/', async(req, res) => {
    var userExists = true;

    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }
    await ExpiredToken.findOne({ where: { token: req.headers["authorization"] } }).then(expired => {
        if (expired) {
            userExists = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    const user = await User.findOne({ where: { id: decoded.id, status: 'existing' } }).catch(errHandler);

    if (!user) {

        userExists = false;
        res.status(404).send({ message: "User not found" })
        res.end()
    }


    const org = await OrgUser.findOne({
        where: {
            userid: decoded.id,
            orgid: req.body.orgid
        }
    })
    if (org) {
        userExists = false;
        res.status(400).send({ error: "Can't join", message: "You can't join this organization" });
        res.end()

    }

    if (userExists) {
        result = validation(req.body.orgid, req.body.email)
        if (result.validChecks) {
            var domain = true;
            var orglatitude = 0;
            var orglongitude = 0;
            const organizationDetails = await Organization.findOne({ where: { id: req.body.orgid } }).catch(errHandler);
            orglatitude = organizationDetails.latitude;
            orglongitude = organizationDetails.longitude;
            if (!((req.body.email).includes(organizationDetails.domain))) {
                domain = false;
            }
            if (domain) {



                var x = orglatitude;
                var y = orglongitude;
                var z = decoded.latitude;
                var w = decoded.longitude;
                var body12 = {}
                var body21 = {}
                var url12 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(z, ',', w, '&destinations=', x, ',', y, '&key=', API_KEY);
                var url21 = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='.concat(x, ',', y, '&destinations=', z, ',', w, '&key=', API_KEY);
                await request.post(url12).then(function(body) {
                    body12 = body;
                })
                await request.post(url21).then(function(body) {
                    body21 = body;
                })
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

                //Insert org user 
                const orgUserData = {
                    orgid: parseInt(req.body.orgid),
                    userid: decoded.id,
                    distancetoorg: distance12,
                    timetoorg: time12,
                    distancefromorg: distance21,
                    timefromorg: time21,
                    status: 'existing'
                }
                const orguser = await OrgUser.create(orgUserData).catch(errHandler);
                if (orguser) {
                    res.status(200).send({ message: "Organization is chosen" });
                }
                let transporter = nodeMailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,

                    auth: {
                        // should be replaced with real sender's account
                        user: 'felsekkacarpooling@gmail.com',
                        pass: 'felsekka1234.'
                    }
                });
                let mailOptions = {
                    // should be replaced with real recipient's account
                    to: req.body.email,
                    subject: "Verification",
                    text: "Hello " + user.firstname +
                        ",\n Please verify your email address to enroll in " + organizationDetails.name + " organization.\n http://3.81.22.120:3000/api/verify_org/" + decoded.id + "/" + orguser.id
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });


            } else {

                res.status(400).send({ error: "Can't join", message: "You can't join this organization" });
                res.end()

            }



        } else {
            res.status(400).send(result.message);
            res.end()


        }
    }
});

module.exports = { router, validation };