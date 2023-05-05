const express = require("express");
const router = express.Router();
const fixed = require('../modal/fixedproducts')

// save deposits
router.post('/deposits', async (req, res) => {

    // call function to save deposist
    //console.log(req.body.data)
    let mydata = req.body.data
    var unsaved = 0
    var countSaved = 0
    var checker = 0 // checks if the loop has completed running

    mydata.forEach(el => {

        fixed.deposists(el["clientId"], el["accountNo"], el["deposit"], el["name"], el["date"]).then((data) => {

            checker++

            if (data.affectedRows === 1) {
                countSaved++
            }


            if (data.affectedRows === 0) {
                unsaved++
            }

            if (checker === mydata.length) {

                if (countSaved === mydata.length) {
                    res.json("DATA SAVED")
                }


                if (mydata.length === unsaved) {
                    res.json("DATA NOT SAVED")
                }


                // other options
                if (countSaved > 0) {
                    res.json("SOME DATA SAVED")
                }
            }
        })
    });
})


// call function to get deposist
router.get('/deposits', async (req, res) => {

    // call function to get deposits
    fixed.getDeposits(req.query.accountNo, req.query.clientId).then(data => {
        
        res.json(data)

    }).catch((error) => {
        console.log(error)
    })

})


// save interest postings
router.post('/interestpostings', (req, res) => {
    
    //call function to save interest postings
    // call function to save deposist
    //console.log(req.body.data)
    let mydata = req.body.data
    var countSaved = 0
    var notSaved = 0
    var checker = 0
    
    mydata.forEach(el => {
        
        fixed.saveInterestpostings(el["clientId"], el["accountNo"], el["interestposting"], el["name"], el["date"]).then((data) => {
            
            
            if (data.affectedRows === 1) {
                countSaved++
            
            }
            if (data.affectedRows === 0) {
                notSaved++
            }
            
            if (checker === mydata.length) {
                
                if (countSaved === mydata.length) {
                    res.json("DATA SAVED")
                }
                
                if (notSaved === mydata.length) {
                    res.json("DATA NOT SAVED")
                }
                
                // other options
                if (countSaved > 0) {
                    res.json("SOME DATA SAVED")
                }
            
            }
            
            
            
            /*
            if ((countSaved > 0) && (innerLoopCount === dataLenght)) {
                res.json("SOME DATA WAS SAVED")
            }*/
        })
    });

})

router.get('/interestpostings', (req, res) => {
    // call function to get all interest postings of the account
    
    fixed.getInterestPostings(req.query.accountNo, req.query.clientId).then(data => {
        
        res.json(data)
    
    }).catch((error) => {
        console.log(error)
    })


})

//get fixed deposits accounts details from muson 
router.get('/fixedproductdetails', (req, res) => {
    
    fixed.getFixedPositeDetails(req.query.accountNo).then((data) => {
        
        if (data.data !== undefined) {
            res.json(data.data)
        }
    
    }).catch((error) => {
        
        console.log(error)

    })

})



module.exports = router


