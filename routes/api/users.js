const users = require('../../models/users');
const express = require ('express');
const router = express.Router();


const members = [
    {
        id:1,
        name:"nariman"

    }
];

//SignUp
router.get('/signup' , (req,res)=>{
const userData = {
    firstname : req.body.firstname,
    lastname : req.body.lastname,
    phonenumber : req.body.phonenumber,
    password : req.body.password,
    gender : req.body.gender,
    birthdate : req.body.birthdate,
    photo : req.body.photo,
    ridewith : req.body.ridewith,
    smoking : req.body.smoking,
    rating : req.body.rating,
    status : req.body.status
}
res.json(members);

});

module.exports = router;