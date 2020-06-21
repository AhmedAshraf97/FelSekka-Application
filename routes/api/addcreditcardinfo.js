const creditcard = require('../../models/creditcard');
const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env.SECRET_KEY = 'secret';
const ExpiredToken = require('../../models/expiredtokens');

//Error handler
const errHandler = err => {
    //Catch and log any error.
    console.error("Error: ", err);
};
router.post('/', async(req, res) => {
    var decoded;
    var userExists = true;

    try {
        decoded = jwt.verify(req.headers["authorization"], process.env.SECRET_KEY)

    } catch (e) {
        userExists = false;
        res.status(401).send({ message: "You aren't authorized" })
        res.end();
    }
    await ExpiredToken.findOne({ where: { token: req.headers["authorization"] } }).then(expired => {
        if (expired) {
            userExists = false;
            res.status(401).send({ message: "You aren't authorized" })
            res.end();
        }
    }).catch(errHandler)
    await User.findOne({ where: { id: decoded.id, status: 'existing' } }).then(user => {
        if (!user) {
            userExists = false;
            res.status(404).send({ message: "User not found" })
            res.end()
        }
    }).catch(errHandler);

    if (userExists) {
         if (req.body.cardnumber == null) {
            res.status(400).send({ error: "Card number", message: "Card number paramter is missing" });
        } else if (((req.body.cardnumber).toString()).trim().length === 0) {
            res.status(400).send({ error: "Card number", message: "Card number can't be empty" });
        }else if (((req.body.cardnumber).toString()).trim().length != 16) {
            res.status(400).send({ error: "Card number", message: "Card number must be 16 digits" });
        }
        else if (req.body.cvv == null) {
            res.status(400).send({ error: "cvv", message: "cvv paramter is missing" });
        } else if (((req.body.cvv).toString()).trim().length === 0) {
            res.status(400).send({ error: "cvv", message: "cvv can't be empty" });
        } else if (((req.body.cvv).toString()).trim().length != 3) {
            res.status(400).send({ error: "cvv", message: "cvv must be 3 digits" });
        }
        else if (req.body.expirationdate == null) {
            res.status(400).send({ error: "expirationdate", message: "expirationdate paramter is missing" });
        } else if (((req.body.expirationdate).toString()).trim().length === 0) {
            res.status(400).send({ error: "expirationdate", message: "expirationdate can't be empty" });
        }else if (!(/^(0[1-9]|1[0-2])\/\d{2}$/.test(req.body.expirationdate))) {
            res.status(400).send({ error: "expirationdate", message: "expirationdate is unvalid" });
        }else { 
            creditcardexists=false
            await creditcard.findOne({  
                where: {
                  userid: decoded.id
                }}).then(data => {
                    if(data){
                        creditcardexists=true
                    }
            }).catch(errHandler);

            if(!creditcardexists){
            const creditcarddata = {
                userid: decoded.id,
                cardnumber: req.body.cardnumber,
                cvv: req.body.cvv,
                expirationdate: req.body.expirationdate
            }
        
            await creditcard.create(creditcarddata).then(user => {
                res.status(200).send({ message: "Credit card information is inserted" });
            }).catch(errHandler);
        }
        else{
            
            res.status(400).send({ message: "This user has already inserted his credit card information" });
        }

        }
    }
});




module.exports = router;