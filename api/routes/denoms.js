const express = require("express");
const router = express.Router();
const denoms = require('../modal/demons')


// save denomns for a teller
router.post('/', async (req, res) => {

    let data = req.body

    let demons = data.denomns

    try {

        await denoms.saveDenoms(data.user, demons).then((data) => {

            console.log(data)

        })

    } catch (err) {
        console.log(err)
    }

    //denoms.saveDenoms()

    res.json("saved")

})

// save deductions 
router.post('/deduct', (req, res) => {


    let data = req.body
    let denoms1 = data.denoms

    console.log(data)

    try {

        denoms.deductDenoms(data.user, denoms1).then((data) => {

        }).catch((err) => {
            console.log(err)
        })

        res.json("saved")

    } catch (err) {
        console.log(err)
    }



})


//save a teller username
router.post('/save', (req, res) => {

    denoms.inserTellerDenoms(req.body.username, req.body.date).then((data) => {

    })
})

// save denomns from admin
router.post('/denomsadmin', async (req, res) => {

    let result = await denoms.adminDenoms(req.body.denoms)

    console.log(result)

    if (result.affectedRows === 0) {
        res.json({ message: "failed" })
    }

    if (result.affectedRows === 1) {
        res.json({ message: "saved" })
    }

})

// get current values of denominations
router.get('/denoms', async (req, res) => {

    //console.log(req.query.username)
    let result = await denoms.getDenominations(req.query.username, req.query.date)

    res.json(result)
})


//teller demons
router.get('/telleradmindenoms', (req, res) => {

    denoms.getAllTellersDenomns(req.query.date).then(data => {
        //console.log(data)
        res.json(data)
    })
})




module.exports = router