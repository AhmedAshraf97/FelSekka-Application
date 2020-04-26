const User = require('../../models/users');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const regex = require('regex');
const bcrypt = require('bcrypt')
var Sequelize = require('sequelize');
const ExpiredToken = require('../../models/expiredtokens');
router.post('/', async(req, res) => {

    let isvalid = false



    await User.findOne({
            where: {
                email: req.body.email,
                "status": "existing"
            }
        }).then(user => {
            if (user) {


                //Password validation
                if (req.body.oldpassword === undefined) {


                    isvalid = true
                    res.status(400).send({ error: "Old password ", message: "Old password is missing" });


                }

                if (req.body.oldpassword !== undefined && isvalid === false) {


                    if (!bcrypt.compareSync(req.body.oldpassword, user.password)) {


                        isvalid = true
                        res.status(400).send({ error: "Old password ", message: "Old password is incorrect" });

                    } else if (req.body.newpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "New password", message: "New password paramter is missing" });
                    } else if (!((typeof(req.body.newpassword) === 'string') || ((req.body.newpassword) instanceof String))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be a string" });
                    } else if ((req.body.newpassword).trim().length === 0) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password can't be empty" });
                    } else if (!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$/.test(req.body.newpassword))) {
                        isvalid = true
                        res.status(400).send({ error: "Password", message: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character" });
                    } else if (req.body.confirmpassword == undefined) {
                        isvalid = true
                        res.status(400).send({ error: "Confirm password", message: "Confirm password paramter is missing" });
                    }


                    //Confirm password validation
                    else if ((req.body.confirmpassword).trim().length === 0) { /////////askk, string
                        isvalid = true
                        res.status(400).send({ error: "Confirm password", message: "Password can't be empty" });
                    } else if (!(req.body.newpassword === req.body.confirmpassword)) {
                        isvalid = true
                        res.status(400).send({ error: "Confirm password ", message: "Passwords don't match" });
                    }
                }



                let bcryptPass
                if (req.body.newpassword !== undefined) {
                    bcryptPass = bcrypt.hashSync(req.body.newpassword, 10)
                } else {
                    bcryptPass = user.password

                }

                if (isvalid === false) {


                    user.update({

                        password: bcryptPass




                    }, {
                        where: { id: decoded.id }
                    }).then(res.status(200).send("OK"))


                }

            } else
                res.status(401).send("User doesn't exist, Please Enter valid ID")
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})
module.exports = router;