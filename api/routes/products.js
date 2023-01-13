const express = require("express");
const router = express.Router();
const products = require('../modal/products')
const calculator = require("../modal/calculator")
const app = require('../modal/app')
//get loans for a clients


router.get('/testformula', (req, res) => {

    let amount = (1 / 12) * (13 / 100) * (250)

    console.log(amount.toFixed(2))

})


router.get('/loans', async (req, res) => {

    // loans of clients
    products.loans().then((data) => {

        res.json(data.data)

    }).catch((err) => {
        console.log(err)
    })

})

// get all loan chargies
router.get('/chargies', async (req, res) => {

    // get chargies to be filtered
    products.chargies().then((data) => {

        res.json(data.data)

    })

})

// calculate pelnaties for a loan 
router.get('/chargepenalties', async (req, res) => {

    products.loans().then((data) => {


        let myData = data.data["pageItems"]
        res.json(myData)

        //filter(chargies => chargies.Code.includes(el["Code"]))
        //let newData = mydata.filter((penalties) => penalties.)

    })

})

// get client loan details
router.get("/clientloan", (req, res) => {


    products.loanClientDetails(req.query.loanId).then(data => {

        //res.json(data)
        if (data === undefined) {
            res.json("NO ACCOUNT FOUND")
        } else {
            res.json(data.data)
        }


    }).catch(error => {
        console.log(error)
    })

})

//save loan arears details
router.post('/saveLoanArears', (req, res) => {

    try {

        let data = req.body.data


        /*
            {
          accountNo: '000000248',
          interest: '7.25',
          principal: '6300',
          arrears: '2275.04',
          arrearsDate: '07/23/2022',
          arrearsDay: '125',
          totalOverdue: '2275.04'
        }
        
        */

        data.forEach(el => {
            products.loanArearsDetails(el.accountNo, el.principal, el.interest, el.arrearsDate, el.arrearsDay, el.totalOverdue, el.maturityDate, el.loanterm).then(dt => {

                console.log(dt)
            })
        });


    } catch (err) {
        console.log(err)
    }
})

//run loan arears

router.post('/runloanArears', (req, res) => {

    //84430.77

    var todayDate = new Date().toISOString().split('T')[0]

    try {

        setInterval(() => {
            //function to get one loan arear detail
            products.getLoanArearsDetails().then(dt => {


                dt.forEach(el => {

                    /*
                    let r = (((parseInt(el["interest"]) / 100)) / 12)   //r interest in monthly
                    let n = parseInt(el["loanterm"])  // number of repayments

                    let repayment = (p) / ((Math.pow((1 + r), n) - (1)) / ((r * (Math.pow((1 + r), n)))))
                    */
                    //have a variable which will multiply by 3 because 90 days leads to 3 repayments

                    let transDate

                    if ((new Date(todayDate)) > (new Date(el["maturityDate"]))) {
                        transDate = el["maturityDate"]
                    } else {
                        transDate = todayDate
                    }

                    let arrears = parseFloat(el["totalOverDue"])

                    let amount = (1 / 12) * (13 / 100) * (arrears)

                    console.log(el["accountNo"])
                    console.log(amount)

                    //run loan penalty

                    products.runloanPenalty(el["accountNo"], amount.toFixed(2), calculator.myDate(transDate)).then(dt => {

                        console.log(dt["data"])

                        if (dt["status"] === 200) {

                            //call another function to update database
                            products.updateLoanArrears(el["accountNo"]).then(results => {
                                //console.log(results)
                            })
                        }

                    }).catch(err => {
                        console.log(err)
                    })

                })
            })
        }, 5000);


    } catch (err) {
        console.log(err)
    }
})

//router to transfer all amount from a mula savings accounts

router.post('/emptyMulaAccounts', (req, res) => {


    try {

        var todayDate = new Date().toISOString().split('T')[0]

        //call function to make a withdrawal

        //run each after 5 s

        setInterval(() => {

            products.getMulaAccount().then(dt => {

                dt.forEach(el => {

                    //make a withdrawal of some amount calculator.myDate(transDate)
                    app.makeWithdrawal(calculator.myDate(todayDate), el["amount"], el["accountNo"], "Customer Payout").then((withdraw) => {

                        console.log(withdraw.data)

                        //update function if saved

                        if (withdraw["status"] === 200) {

                            //call function to update database
                            products.updateMulaAccounts(el["accountNo"]).then(updated => {

                                console.log(updated.data)

                            })

                        }

                    }).catch(err => {
                        console.log(err)
                    })

                })

            })

        }, 5000);

    } catch (err) {
        console.log(err)
    }


})

//save mula accounts to be emptied
router.post('/saveMula', (req, res) => {

    // function to save mula

    let data = req.body

    //console.log(data)

    data.forEach((dt) => {

        products.saveMulaAccounts(dt["accountNo"], dt["balance"]).then(rs => {

            console.log(rs)

        })

    })


})


// save ftTosavingsAccount

router.post('/ftTosavingsAccount', (req, res) => {


    let data = req.body

    data.forEach((dt) => {

        products.ftTosavingsAccount(dt["fromAccountNo"], dt["toAccountNo"], dt["amount"], dt["date"]).then(data => {
            console.log(data)
        })
    })
})


// run transfers from FP accounts to Fixed Periods

router.post('/transferFPtoPeriod', () => {

    try {

        var todayDate = new Date().toISOString().split('T')[0]

        //set time out
        setInterval(() => {

            products.getFtsavings().then(dt => {

                console.log(dt)

                dt.forEach(el => {

                    //calculator.myDate(todayDate)

                    app.makeWithdrawal(calculator.myDate(todayDate), el["amount"], el["fromAcc"], el["toAccount"]).then(data => {

                        if (data["status"] === 200) {
                            console.log("In go and deposit")

                            products.updateFPtransfer(el["fromAcc"]).then(update => {
                                console.log(update)
                            })

                            /*
                            
                            app.makeDeposit(calculator.myDate(el["tranferDate"]), el["amount"], el["toAccount"], el["fromAcc"]).then(dat => {
                                
                                console.log(dat)
                                
                                if (data["status"] === 200) {
                                    
                                    //update database
                                
                                }
                            }).catch(err => {
                                console.log(err)
                            })
                            
                            */
                        }
                    }).catch(err => {
                        console.log(err)
                    })
                })
            })
        }, 10000);

    } catch (err) {
        console.log(err)
    }
})


// reshedule a loan

//save loan interest values
router.post('/loanReshedule', (req, res) => {

    try {


        let data = req.body.data

        console.log(data)

        data.forEach(el => {

            products.saveResheduleLoan(el["accountNo"], el["rate"], el["Month"]).then((data) => {

                console.log(data)

            }).catch(err => {
                console.log(err)
            })
        })

        /*
       */

    } catch (err) {
        console.log(err)
    }
})


// reshedule loan on Musoni
router.post('/reshedule', (req, res) => {

    setInterval(() => {

        //get un resheduled loan
        products.getResheduleLoan().then(data => {

            let dbData = data

            dbData.forEach((el) => {

                console.log(el["accountNo"])

                products.loanReshedule(el["accountNo"], el["rate"], el["month"]).then(dt => {

                    if (dt["status"] === 200) {
                        console.log("FINE")

                        //update resheduled loan
                        products.updateresheduledLoan(el["accountNo"]).then(dbRes => {

                            if (dbRes["affectedRows"] === 1) {
                                console.log("Resheduled Succesfully")
                            }
                        })

                    } else {
                        console.log("ERROR OCCURED")
                    }

                }).catch(err => {
                    console.log(err)
                })

            })
        })
    }, 5000);
})



module.exports = router 