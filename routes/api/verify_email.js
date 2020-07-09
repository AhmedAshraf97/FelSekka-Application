const User = require('../../models/users');
const express = require('express');
const router = express.Router();
var Sequelize = require('sequelize');
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
        res.status(200).send({ message: "user is verified" });
    }).catch(errHandler);
})
module.exports = router