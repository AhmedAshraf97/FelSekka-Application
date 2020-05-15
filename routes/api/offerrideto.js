const offerRideFrom = require('../../models/offerridefrom'); 
const offerRideTo = require('../../models/offerrideto'); 
const requestRideFrom = require('../../models/requestridefrom'); 
const requestRideTo = require('../../models/requestrideto'); 
const orgUser = require('../../models/orgusers'); 
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
const isToday = (date) => {
    const today = new Date();
    someDate = new Date(date);
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

router.post('/', async(req, res) => {


    var userExists = true;
    var decoded;
    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)
    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized to offer a ride " })
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
        //Car id validation
        if (req.body.carid == null) {
            res.status(400).send({ error: "Car ID", message: "Car ID paramter is missing" });
        } else if (((req.body.carid).toString()).trim().length === 0) {
            res.status(400).send({ error: "Car ID", message: "Car ID can't be empty" });
        }
        //Number of seats validation
        if (req.body.numberofseats == null) {
            res.status(400).send({ error: "Number of seats", message: "Number of seats paramter is missing" });
        } else if (((req.body.numberofseats).toString()).trim().length === 0) {
            res.status(400).send({ error: "Number of seats", message: "Number of seats can't be empty" });
        } else if (((typeof(req.body.numberofseats) === 'string') || ((req.body.numberofseats) instanceof String))) {
            res.status(400).send({ error: "Number of seats", message: "Number of seats must be a number" });
        }
        //Organization id validation
        else if (req.body.toorgid == null) {
            res.status(400).send({ error: "To org ID", message: "To org ID paramter is missing" });
        }else if (((req.body.toorgid).toString()).trim().length === 0) {
            res.status(400).send({ error: "To org ID", message: "To org ID can't be empty" });
        }
        //Date validation
        else if (req.body.date == null) {
            res.status(400).send({ error: "Date", message: "Date paramter is missing" });
        } else if (!((typeof(req.body.date) === 'string') || ((req.body.date) instanceof String))) {
            res.status(400).send({ error: "Date", message: "Date must be a string" });
        } else if ((req.body.date).trim().length === 0) {
            res.status(400).send({ error: "Date", message: "Date can't be empty" });
        } else if (!(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(req.body.date))) {
            res.status(400).send({ error: "Date", message: "Date is unvalid" });
        } 
        //Earliest time
        else if (req.body.earliesttime == null) {
            res.status(400).send({ error: "Earliest time", message: "Earliest time paramter is missing" });
        } else if (!((typeof(req.body.earliesttime) === 'string') || ((req.body.earliesttime) instanceof String))) {
            res.status(400).send({ error: "Earliest time", message: "Earliest time must be a string" });
        } else if ((req.body.earliesttime).trim().length === 0) {
            res.status(400).send({ error: "Earliest time", message: "Earliest time can't be empty" });
        } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(req.body.earliesttime))) {
            res.status(400).send({ error: "Earliest time", message: "Earliest time is unvalid" });
        } else if ((new Date() - new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString())) > 0) {
            res.status(400).send({ error: "Date and time", message: "The ride can't be in the past" });
        }
        //Arrival time validation
        else if (req.body.arrivaltime == null) {
            res.status(400).send({ error: "Arrival time", message: "Arrival time paramter is missing" });
        } else if (!((typeof(req.body.arrivaltime) === 'string') || ((req.body.arrivaltime) instanceof String))) {
            res.status(400).send({ error: "Arrival time", message: "Arrival time must be a string" });
        } else if ((req.body.arrivaltime).trim().length === 0) {
            res.status(400).send({ error: "Arrival time", message: "Arrival time can't be empty" });
        } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(req.body.arrivaltime))) {
            res.status(400).send({ error: "Arrival time", message: "Arrival time is unvalid" });
        } else if (((new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString())) - (new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString()))) <= 0) {
            res.status(400).send({ error: "Arrival time", message: "Arrival time can't be before earliest time" });
        }
        //Ride with validation
        else if (req.body.ridewith == null) {
            res.status(400).send({ error: "Ride with", message: "Ride with paramter is missing" });
        } else if (!((typeof(req.body.ridewith) === 'string') || ((req.body.ridewith) instanceof String))) {
            res.status(400).send({ error: "Ride with", message: "Ride with must be a string" });
        } else if ((req.body.ridewith).trim().length === 0) {
            res.status(400).send({ error: "Ride with", message: "Ride with can't be empty" });
        }
        //Smoking validation
        else if (req.body.smoking == null) {
            res.status(400).send({ error: "Smoking", message: "Smoking paramter is missing" });
        } else if (!((typeof(req.body.smoking) === 'string') || ((req.body.smoking) instanceof String))) {
            res.status(400).send({ error: "Smoking", message: "Smoking must be a string" });
        } else if ((req.body.smoking).trim().length === 0) {
            res.status(400).send({ error: "Smoking", message: "Smoking can't be empty" });
        }
         else {
            var error =false;
            var existinorg = true;
            await offerRideFrom.findAll({ 
                where: {
                    userid: decoded.id,
                    status: {[Op.or]: ["pending", "scheduled","ongoing"]}    
                }
                }).then(rides=>{
                    rides.forEach(ride=> {
                        var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                        var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
                        var rideStart = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
                        var rideEnd = new Date((ride.date.toString()) + " " + (ride.latesttime).toString());
                        if((rideStart<= reqStart) && (reqStart<= rideEnd)) {
                            error =  true;
                        }
                        else if((rideStart<= reqEnd) && (reqEnd<= rideEnd) ){
                            
                            error =  true;
                        }  
                        else if((reqStart<=rideEnd) && (rideEnd<= reqEnd)){
                           
                            error = true;
                        }
                        else if((reqStart<=rideStart)&&(rideStart<=reqEnd)){
                            
                            error = true;
                        }
                    });
                }).catch(errHandler);
            await offerRideTo.findAll({ 
                where: {
                    userid: decoded.id,
                    status: {[Op.or]: ["pending", "scheduled","ongoing"]}    
                }
                }).then(rides=>{
                
                    rides.forEach(ride=> {
                        var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                        var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
                        var rideStart = new Date((ride.date.toString()) + " " + (ride.earliesttime).toString());
                        var rideEnd = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());
                        
                        if((rideStart<= reqStart) && (reqStart<= rideEnd)) {
                            error =  true;
                        }
                        else if((rideStart<= reqEnd) && (reqEnd<= rideEnd) ){
                            
                            error =  true;
                        }  
                        else if((reqStart<= rideEnd) && (rideEnd<= reqEnd)){
                           
                            error = true;
                        }
                        else if((reqStart<= rideStart)&& (rideStart<= reqEnd)){
                            
                            error = true;
                        }
                    });
                }).catch(errHandler);
            await requestRideTo.findAll({ 
                where: {
                    userid: decoded.id,
                    status: {[Op.or]: ["pending", "scheduled","ongoing"]}    
                }
                }).then(rides=>{
                    rides.forEach(ride=> {
                        var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                        var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
                        var rideStart = new Date((ride.date.toString()) + " " + (ride.earliesttime).toString());
                        var rideEnd = new Date((ride.date.toString()) + " " + (ride.arrivaltime).toString());
                        if((rideStart<= reqStart) && (reqStart<= rideEnd)) {
                            error =  true;
                        }
                        else if((rideStart<= reqEnd) && (reqEnd<= rideEnd) ){
                            
                            error =  true;
                        }  
                        else if((reqStart<=rideEnd) && (rideEnd<= reqEnd)){
                           
                            error = true;
                        }
                        else if((reqStart<=rideStart)&&(rideStart<=reqEnd)){
                            
                            error = true;
                        }
                    });
                }).catch(errHandler); 
            await requestRideFrom.findAll({ 
                where: {
                    userid: decoded.id,
                    status: {[Op.or]: ["pending", "scheduled","ongoing"]}    
                }
                }).then(rides=>{
                    rides.forEach(ride=> {
                        var reqStart = new Date((req.body.date.toString()) + " " + (req.body.earliesttime).toString());
                        var reqEnd = new Date((req.body.date.toString()) + " " + (req.body.arrivaltime).toString());
                        var rideStart = new Date((ride.date.toString()) + " " + (ride.departuretime).toString());
                        var rideEnd = new Date((ride.date.toString()) + " " + (ride.latesttime).toString());
                        if((rideStart<= reqStart) && (reqStart<= rideEnd)) {
                            error =  true;
                        }
                        else if((rideStart<= reqEnd) && (reqEnd<= rideEnd) ){
                            
                            error =  true;
                        }  
                        else if((reqStart<=rideEnd) && (rideEnd<= reqEnd)){
                           
                            error = true;
                        }
                        else if((reqStart<=rideStart)&&(rideStart<=reqEnd)){
                            
                            error = true;
                        }
                    });
                }).catch(errHandler);    
            await orgUser.findOne({
                where:{
                    userid: decoded.id,
                    orgid:req.body.toorgid,
                    status: "existing"
                }
                }).then(orguser=>{
                    if(!orguser){
                        existinorg = false;
                    }
                    else{
                        existinorg = true;
                    }
                }).catch(errHandler)   
            
            const rideData = {
                userid: decoded.id,
                carid: req.body.carid,
                fromlatitude: decoded.latitude,
                fromlongitude: decoded.longitude,
                toorgid: req.body.toorgid,
                date: req.body.date,
                arrivaltime: req.body.arrivaltime,
                ridewith: req.body.ridewith,
                smoking: req.body.smoking,
                earliesttime: req.body.earliesttime,
                numberofseats: req.body.numberofseats,
                status: "pending"
            }
            if(!existinorg){
                res.status(401).send( {error:"Organization" , message:"You are not assigned to this organization"});        
            }
            else if(error){
                res.status(401).send( {error:"error" , message:"You can't have two rides at the same time"});        
            }
            else{
                await offerRideTo.create(rideData).then(ride => {
                    res.status(200).send({ message: "Offer is made successfully" });
                }).catch(errHandler);
            }
        }
    }
});
module.exports = router;