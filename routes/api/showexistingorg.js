const OrgUser = require('../../models/orgusers');
const express = require('express');
const Organization = require('../../models/organizations');
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
    /*var userExists = false;
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
    var allExistingOrg = {};
    var existingOrg = {};
    var count=0;
    if(userExists){  
        await Organization.findAll({ 
            where: {
                status: "existing"
            }
            }).then(existingOrganizations=>
                {
                    allExistingOrg = existingOrganizations; 
            }).catch(errHandler);
   
    for (i = 0; i < allExistingOrg.length; i++) {
        existingOrganization = allExistingOrg[i];
        await OrgUser.findOne({ 
            where: { 
                [Op.and]: [
                {orgid:existingOrganization.id},
                {userid:decoded.id},
                {status: 'existing'}
            ]
        }})
        .then(user => {
            if(!user){
                console.log('hi');
                existingOrg[count] = existingOrganization;
                count++;
            }
        }).catch(errHandler);
    }
    /////////////////////////////
    allExistingOrg.forEach(existingOrganization => { 
    await OrgUser.findOne({ 
            where: { 
                [Op.and]: [
                {orgid:existingOrganization.id},
                {userid:decoded.id},
                {status: 'existing'}
            ]
        }})
        .then(user => {
            if(!user){
                console.log('hi');
                existingOrg[count] = existingOrganization;
                count++;
            }
        }).catch(errHandler);
            
    });/////////////////////////////
    
    res.status(200).json(count);
}*/
});
module.exports = router;