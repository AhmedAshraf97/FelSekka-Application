const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.post('/', async(req, res) => {

    var decoded;
    var ValidChecks = true;
    tokenexpired = false
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        ValidChecks = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }
    if (ValidChecks) {
        console.log(req.headers["authorization"])
        await ExpiredToken.create({ token: req.headers["authorization"] })
            .then(result => {
                tokenexpired = true    
            }).catch(errHandler)
        
        if(tokenexpired){
            await User.findOne({where: { id: decoded.id }}).then(user=>{
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY)
                res.status(200).send({ token:token, message: "OK" })} 
            ).catch(errHandler);
        }
        else{
            res.status(400).send({ message: "error" })}
        
    }
})

module.exports = router;