const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();


//login to muson

router.post('/', (req, res) => {

    let username = req.body.username
    let password = req.body.password

    if(username === process.env.portalusername && password === process.env.portalpassword) {
        res.json({message : "welcome"})
    }else {
        res.json({message : "failed"})
    }

})



module.exports = router