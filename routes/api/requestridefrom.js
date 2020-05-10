const requestRideFrom = require('../../models/requestridefrom'); 
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
    //Organization id validation
    if (req.body.fromorgid == null) {
        res.status(400).send({ error: "From org id", message: "From org id paramter is missing" });
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
    }else if(! (Date.parse(req.body.date)-Date.parse(new Date())>= 0)  && (!(isToday(req.body.date)))){ 
        console.log("hi")  
        res.status(400).send({ error: "Date", message: "Date can't be in the past" });
    }
    //Departure time validation
    else if (req.body.departuretime == null) {
    res.status(400).send({ error: "Departute time", message: "Departute time paramter is missing" });
    } else if (!((typeof(req.body.departuretime) === 'string') || ((req.body.departuretime) instanceof String))) {
        res.status(400).send({ error: "Departute time", message: "Departute time must be a string" });
    } else if ((req.body.departuretime).trim().length === 0) {
        res.status(400).send({ error: "Departute time", message: "Departute time can't be empty" });
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(req.body.departuretime))) {
        res.status(400).send({ error: "Departute time", message: "Departute time is unvalid" });
    }else if(  (new Date() -  new Date((req.body.date.toString()) + " " + (req.body.departuretime).toString()))>0){
        res.status(400).send({ error: "Departute time", message: "Departute time can't be in the past" });
        
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
    //Latest time
    else if (req.body.latesttime == null) {
    res.status(400).send({ error: "Latest time", message: "Latest time paramter is missing" });
    } else if (!((typeof(req.body.latesttime) === 'string') || ((req.body.latesttime) instanceof String))) {
        res.status(400).send({ error: "Latest time", message: "Latest time must be a string" });
    } else if ((req.body.latesttime).trim().length === 0) {
        res.status(400).send({ error: "Latest time", message: "Latest time can't be empty" });
    } else if (!(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(req.body.latesttime))) {
        res.status(400).send({ error: "Latest time", message: "Latest time is unvalid" });
    }
    else {
        const rideData = {
            userid : decoded.id,
            tolatitude:decoded.latitude,
            tolongitude:decoded.longitude,
            fromorgid:req.body.fromorgid,
            date:req.body.date,
            departuretime:req.body.departuretime,
            ridewith:req.body.ridewith,
            smoking:req.body.smoking,
            latesttime:req.body.latesttime,
            status: "pending"
        }
        await requestRideFrom.create(rideData).then(ride=>{
                res.status(200).send( {message:"OK"});
        }).catch(errHandler);

    }
}
});

module.exports = router;