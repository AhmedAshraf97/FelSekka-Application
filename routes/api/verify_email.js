const User = require('../../models/users');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
var fs = require('fs');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};

router.get('/:id', async(req, res) => {

    await User.update({ status: 'existing' }, {
        where: {
            id: req.params.id,
            status: 'pending'
        }
    }).then(user => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        fs.readFile("./verify_email.html", null, function(error, data) {
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