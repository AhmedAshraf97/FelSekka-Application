const OrgUser = require('../../models/orgusers');
const Organization = require('../../models/organizations');
const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async (req, res) => {
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
        //Name validation
        if(req.body.name==null){
            res.status(400).send( {error: "Name", message: "Name paramter is missing"});
        }
        else if(!((typeof (req.body.name) === 'string') || ((req.body.name) instanceof String))){
            res.status(400).send( {error: "Name", message: "Name must be a string"});
        }
        else if( (req.body.name).trim().length === 0){
            res.status(400).send( {error: "Name", message: "Name can't be empty"});
        }
        else if(!(/^[a-zA-Z ]*$/.test(req.body.name))){
            res.status(400).send( {error: "Name", message: "Name can only contain letters"});
        }
        else if((req.body.name).trim().length > 30){
            res.status(400).send( {error: "Name", message: "Name has maximum length of 30 letters"});
        }
        //Latitude validation
        else if (req.body.latitude == null) {
            res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
        } else if (((req.body.latitude).toString()).trim().length === 0) {
            res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
        } else if ((typeof(req.body.latitude) === 'string') || ((req.body.confirmpassword) instanceof String)) {
            res.status(400).send({ error: "Latitude", message: "Latitude must be a decimal" });
        }
        //Longitude validation
        else if(req.body.longitude==null){
            res.status(400).send( {error: "Longitude", message: "Longitude paramter is missing"});
        }
        else if(((req.body.longitude).toString()).trim().length === 0){
            res.status(400).send( {error: "Longitude", message: "Longitude can't be empty"});
        }
        else if( (typeof (req.body.longitude) === 'string') || ((req.body.confirmpassword) instanceof String)){
            res.status(400).send( {error: "Longitude", message: "Longitude must be a decimal"});
        }
        else {
            //Insert org user 
            const orgData = {
            name: req.body.name,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            status: 'pending'	
            }
            await Organization.create(orgData).then(user=>{
                res.status(201).send({message:"Organization is created"}); 
            }).catch(errHandler);
            
        }
    }
});




module.exports = router;