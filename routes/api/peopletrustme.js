const betweenUsers = require('../../models/betweenusers');
const express = require('express');
const User = require('../../models/users');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async (req, res) => {
    var userExists = false;
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);
    await User.findOne({ where: { id: decoded.id }}).then(user=>{
        if(user){
            userExists =true;
        } 
        else {
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);
    if(userExists){
            await betweenUsers.findAll({
                where :{
                    [Op.and]: [
                        {user2id:decoded.id},
                        {trust: 1}
                    ]
                }
            }).then(users=>{
                res.status(200).json(users);
            }).catch(errHandler);
        }
    
});

module.exports = router;