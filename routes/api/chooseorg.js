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
            await  Organization.findOne({ where: { id: req.body.orgid }}).then(org=>{
                if( !((req.body.email).includes(org.domain)) ){
                    domain = false;
                }
            }).catch(errHandler);}
            //Insert org user 
            const orgUserData = {
                orgid: parseInt(req.body.orgid),
                userid: decoded.id,
                distancetoorg: 0.0,
                timetoorg: 0.0,
                distancefromorg: 0.0,
                timefromorg: 0.0,
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