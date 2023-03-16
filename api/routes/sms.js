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

    console.log(data)

    data.forEach(el => {

        //console.log(el)

        
        // save data in database
        clients.saveClient(el["contact"]).then(dt => {
            console.log(dt)
        }) 
    });
})


// send messages
router.post('/sendmessage', (req, res) => {

    let message = `Dear Valued Member, View your monthly statement via the STATUS Mobile APP. Download APP today:  https://play.google.com/store/apps/details?id=io.scbs.buildingsociety`
    
    if (message === "") {
        console.log("No message available")
        return;
    }


    setInterval(() => {

        // get client to send to 
        clients.getClientLocal().then(dt => {

            if (dt.length === 0) {
                console.log("completed")
            }

            dt.forEach(data => {
                sms.sendMessage(data["contact"], message)
            })
        })
    }, 10000);


})


module.exports = router