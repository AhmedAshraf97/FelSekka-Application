const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
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
//Latitude validation
 if (req.body.latitude == null) {
    res.status(400).send({ error: "Latitude", message: "Latitude paramter is missing" });
} else if (((req.body.latitude).toString()).trim().length === 0) {
    res.status(400).send({ error: "Latitude", message: "Latitude can't be empty" });
} else if ((typeof(req.body.latitude) === 'string') || ((req.body.confirmpassword) instanceof String)) {
    res.status(400).send({ error: "Latitude", message: "Latitude must be a decimal" });
}
//Longitude validation
else if (req.body.longitude == null) {
    res.status(400).send({ error: "Longitude", message: "Longitude paramter is missing" });
} else if (((req.body.longitude).toString()).trim().length === 0) {
    res.status(400).send({ error: "Longitude", message: "Longitude can't be empty" });
} else if ((typeof(req.body.longitude) === 'string') || ((req.body.confirmpassword) instanceof String)) {
    res.status(400).send({ error: "Longitude", message: "Longitude must be a decimal" });
}
else {
        res.status(200).send( {message: "OK"});
    }
});

module.exports = router;