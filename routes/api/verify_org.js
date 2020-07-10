const User = require('../../models/users');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
const OrgUser = require('../../models/orgusers');
var fs = require('fs');

const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.get('/:user/:id', async(req, res) => {

    await OrgUser.update({ status: 'existing' }, {
        where: {
            id: req.params.id,
            userid: req.params.user,
            status: 'pending'
        }
    }).then(org => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        fs.readFile("./verify_org.html", null, function(error, data) {
            if (error) {
                res.writeHead(404);
                res.write('File not found');
            } else {
                res.write(data);
            }
        })
    }).catch(errHandler);
})
module.exports = router