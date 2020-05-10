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
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async (req, res) => {
    var userExists = false;
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);
    await User.findOne({ where: { id: decoded.id , status: 'existing'}}).then(user=>{
        if(user){
            userExists =true;
        } 
        else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);
    await ExpiredToken.findOne({where: {token: req.headers["authorization"]}}).then(expired => {
        if (expired) {
            userExists = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)

    if(userExists){  
        await Organization.findAll({ 
            where: {
                status: "pending"
            }
            }).then(pendingOrganizations=>{
            res.status(200).json( pendingOrganizations);
        }).catch(errHandler);
}
});

module.exports = router;