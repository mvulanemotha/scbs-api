const express = require("express");
const router = express.Router();
const auth = require('../modal/auth')
const dotenv = require('dotenv');

dotenv.config();
// roter that will store the charge type


router.post('/', async (req, res) => {

    auth.authUser(req.body.username, req.body.password).then(data => {
        //res.json(data.data["defaultUserMessage:"])

        if (data === undefined) {
            res.json({ message: "Failed To Login" })
        } else {
            
            //save a user to be user in denoms
            res.json(data.data)
        }

    }).catch((err) => {


    })

})



router.post('/active', (req, res) => {

    //check variable if we are activating or deactivating

    if (req.body.action === "deactivate") {
        auth.updateInActive(req.body.username).then((data) => {

            if (data.affectedRows === 1) {
                res.json({ message: "deactivated" })
            }

        }).catch((err) => {
            console.log(err)
        })
    }

    if (req.body.action === "activate") {

        auth.updateActiveUser(req.body.username).then((data) => {

            if (data.affectedRows === 1) {
                res.json({ message: "activated" })
            }

        }).catch((err) => {
            console.log(err)
        })

    }



})

// get status of a user if active or not
router.get('/active', (req, res) => {


    // check this users activity
    auth.checkActiveUser("SCBS0019").then(data => {

        console.log(data)

    })

})



module.exports = router;







