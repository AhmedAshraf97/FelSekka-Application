const User = require('../../models/users');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
var fs = require('fs');
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
const util = require('util');

const readFile = util.promisify(fs.readFile);

function getStuff() {
    return readFile('verify_email.html');
}
router.get('/:id', async(req, res) => {

    const user = await User.update({ status: 'existing' }, {
        where: {
            id: req.params.id,
            status: 'pending'
        }
    }).catch(errHandler);
    if (user) {
        getStuff().then(data => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        }).catch(errHandler)

    }
})
module.exports = router