const express = require("express");
const router = express.Router();
const clients = require("../modal/clients")


// get all the clients
router.get("/", async (req, res) => {

    clients.clients().then((data) => {
        res.json(data.data)
    })
})

// get a specific client
router.get("/client", async (req, res) => {
    
    clients.getClient(req.query.id).then((data) => {
    
    res.json(data.data)
    
    }).catch(err => {
        console.log(err)
    })

})


 



module.exports = router