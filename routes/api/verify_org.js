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

const util = require('util');

const readFile = util.promisify(fs.readFile);

function getStuff() {
    return readFile('verify_org.html');
}

router.get('/:user/:id', async(req, res) => {

    const org = await OrgUser.update({ status: 'existing' }, {
        where: {
            id: req.params.id,
            userid: req.params.user,
            status: 'pending'
        }
    }).catch(errHandler);

    if (org) {
        getStuff().then(data => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        }).catch(errHandler)
    }
})
module.exports = router