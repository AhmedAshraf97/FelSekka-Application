const OrgUser = require('../../models/orgusers');
const express = require('express');
const User = require('../../models/users');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async (req, res) => {
    var userExists = false;
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);
    await User.findOne({ where: { id: decoded.id }}).then(user=>{
        if(user){
            userExists =true;
        } 
        else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);

    if(userExists){
        //Organization ID check
        if(req.body.organizationid==null){
            res.status(400).send( {error: "Organization ID", message: "Organization ID paramter is missing"});
        }
        else {
            //Insert org user 
            const orgUserData = {
            orgid: req.body.organizationid,
            userid: decoded.id	,
            distancetoorg: 0.0,
            timetoorg: 0.0,	
            distancefromorg: 0.0,	
            timefromorg: 0.0,	
            status: 'existing'	
            }
            await OrgUser.create(orgUserData).then(user=>{
                res.status(200).send( {message:"OK"});
            }).catch(errHandler);
        }
    }
});

module.exports = router;