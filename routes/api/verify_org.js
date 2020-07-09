const User = require('../../models/users');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
const OrgUser = require('../../models/orgusers');
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
        res.status(200).send({ message: "organization is verified" });
    }).catch(errHandler);
})
module.exports = router