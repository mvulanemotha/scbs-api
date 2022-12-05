const express = require("express");
const router = express.Router();
const sms = require('../modal/sms')
const clients = require('../modal/clients')

router.post('/', (req, res) => {

    //when acc

    /*
    try {
        
        let number = req.body.phone
        let message = req.body.message
        
        
        sms.sendMessage(number, message, res).then((data) => {
            
            res.json({ message: "sent" })
        
        })
    } catch (error) {
        console.log(error)
    }
    
    */


})


// run sms
router.post('/saveclient', (req, res) => {

    //save customer numbers
    let data = req.body.data

    data.forEach(el => {

        // save data in database
        clients.saveClient(el["contact"]).then(dt => {
            console.log(dt)
        })
    });
})


// send messages
router.post('/sendmessage', (req, res) => {


    let message = ""

    if (message === "") {
        console.log("No message available")
        return;
    }


    setInterval(() => {

        // get client to send to 
        clients.getClientLocal().then(dt => {

            console.log(dt.length)
            if (dt.length === 0) {
                console.log("completed")
            }

            dt.forEach(data => {

                console.log(data["contact"])

                sms.sendMessage(data["contact"], message, res)

                clients.updateSentsms(data["contact"]).then(data => {
                    console.log("saved")
                })

            })

            //console.log(dt["contact"])

            /*
            sms.sendMessage(dt["contact"], message, res)
             
             clients.updateSentsms(dt["contact"]).then(data => {
                 console.log(dt["contact"])
                 console.log("saved")
             }) */
        })
    }, 120000);
})


module.exports = router