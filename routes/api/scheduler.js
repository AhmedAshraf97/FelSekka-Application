const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var request = require('request');


//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {

    await request.post({
        url: 'http://localhost:3000/api/matching'
    }, function(err, httpResponse, body) {
        console.log(body);
    })
    await request.post({
        url: 'http://localhost:3000/api/ReturnTripMatch'
    }, function(err, httpResponse, body) {
        console.log(body);
    })

})
module.exports = router