const RequestTo = require('./models/requestrideto')
const OfferTo = require('./models/offerrideto')
const RequestFrom = require('./models/requestridefrom')
const OfferFrom = require('./models/offerridefrom')
const OrgUser = require('./models/orgusers');
const express = require('express');
const router = express.Router();
const Op = Sequelize.Op;

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {


})