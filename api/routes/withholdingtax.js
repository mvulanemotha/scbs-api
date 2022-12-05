const express = require("express");
const router = express.Router();
const withholdingtax = require('../modal/withholdingtax')
const savingscharge = require('../modal/charge');
const calculator = require("../modal/calculator");


// get then from database and process them

router.get('/', async (req, res) => {
    
    
    //checking if the are records in the database
    try {
        
        withholdingtax.getSaveInterestpostingdetails().then(data => {
            
            if (data.length === 0) {
                res.json({ "message": "ALL POSTINGS HAVE BEEN MADE" })
                return;
            }
            
            
            data.forEach(el => {
                
                var amount = ((el["interestposting"]) * (0.1))
                
                
                console.log(el["interestposting"])
                console.log(amount)
                console.log(el["accountNo"])
                
                savingscharge.createClientCharge(el["accountNo"], amount.toFixed(2), 8, calculator.myDate(el["posteddate"])).then(dt => {
                    
                    let data = dt.data
                    
                    var resourceID = data["resourceId"]
                    
                    // will be used to pay the charge
                    savingscharge.payCharge(el["accountNo"], resourceID, amount.toFixed(2), calculator.myDate(el["posteddate"])).then((newData) => {
                        
                        //console.log(newData)   
                        
                        // call funtion to update database
                        withholdingtax.updateInterest(el["TransactionalID"]).then(dat => {
                            
                            //paycharge function
                            res.json({ message: "Paid withholding tax" })
                        
                        }).catch(err => {
                            console.log(err)
                        })
                    
                    }).catch(err => {
                        console.log(err)
                    })
                
                
                
                }).catch(err => {
                    console.log(err)
                })
            })
        
        }).catch(err => {
            console.log(err)
        })

    } catch (error) {
        console.log(error)
    }

})



//save interest postings on database

router.post('/', async (req, res) => {



    let done = () => {
        res.json({ message: "Data has been saved" })
    }

    try {

        var data = req.body.data

        var countSaved = 0


        data.forEach(el => {

            let date = el["Effective Date"]

            let month = date.slice(0, 2)
            let day = date.slice(3, 5)
            let year = date.slice(6, 11)

            date = year + "-" + month + "-" + day


            withholdingtax.savingsTransactions(el["Client Id"], el["Account Number"], el["Interest Posting"], date, el["Transaction Id"]).then(dat => {

                countSaved++
                // update day 
                withholdingtax.addOneDay(el["Transaction Id"]).then((data) => {
                    //console.log(data)
                })

                if (countSaved === data.length) {
                    done() // called when data has been saved
                }

            }).catch(error => {
                console.log(error)
            }).finally(() => {
                console.log("done")
            })

        });


    } catch (error) {
        console.log(error)
    }



})


// deleted matured and rejected accounts from database

router.post('/savingsmaturedrejected', (req, res) => {


    let accountNo = req.body.data

    accountNo.forEach((el) => {

        withholdingtax.deleteMatured(el).then(data => {

            console.log(data)

        })

    })


})



module.exports = router