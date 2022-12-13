const express = require("express");
const router = express.Router();
const app = require("../modal/app")
const calculator = require("../modal/calculator")
const sms = require('../modal/sms')
const client = require('../modal/clients')
const products = require('../modal/products')
const loanpreditor = require('../modal/loanpredictor')
const chargies = require('../modal/charge')

//router to get all clients accounts

router.get('/clients_accounts', (req, res) => {

    //client No
    let clientNo = req.query.clientNo

    app.clientAccounts(clientNo).then(data => {

        res.json(data.data)

    }).catch(error => {
        console.log(error)
    })

})


// apply for a loan
router.post('/apply_for_loan', (req, res) => {

    try {

        let clientNo = req.body.clientNo
        let amount = req.body.amount
        let submittedDate = req.body.submittedDate
        let repaymentDate = req.body.repaymentDate
        let disbursementDate = req.body.disbursementDate
        let loanId = req.body.loandId
        let loanDuration = req.body.loanDuration

        //call function to make loan application
        app.loanApplication(clientNo, amount, calculator.myDate(submittedDate), calculator.myDate(repaymentDate), calculator.myDate(disbursementDate), loanId, loanDuration).then(data => {

            if (data["status"] === 200) {
                res.json("success")
            } else {
                res.json("failed")
            }

        }).catch(err => {
            //console.log(err)
            //res.sendStatus(503)
            res.json("failed")

        })

    } catch (err) {
        console.log(err)
    }

})


//save clients from a file
router.post('/saveclients', (req, res) => {

    //call function to save clients No and generate random codes


    let data = req.body.data

    data.forEach(el => {
        app.saveCustomers(el["ClientNo"], el["Code"], el["Cell"]).then((data) => {

            console.log(data)

        }).catch(() => {
            res.sendStatus(503)
        })
    });


})


//get client codes and send  sms
router.get('/clientsCodes', (req, res) => {

    // function to get codes
    app.getClientsCodes().then(data => {

        let myData = data;

        myData.forEach(dt => {
            console.log(dt["customerNo"])

            let message = `Dear Valued Customer please use the information to register with SCBS app.`
                + `Temporary Code:` + dt["temporaryCode"]

            sms.sendMessage(dt["contact"], message, res)
        });


        /*
         customerNo: '0912',
        temporaryCode: 'SCBS-818295',
        status: 1,
        contact: '76222186'
        */


        // call function to send sms     
        /*sms.sendMessage(number, message, res).then((data) => {
            
            res.json({ message: "sent" })
        
        })*/

    }).catch((err) => {

        res.sendStatus(err)

    })

})

//register a new application user
router.post('/register', (req, res) => {

    let dataM = req.body
    let tempCode = dataM.temporaryCode

    try {
        //get client number from a customerNo table then include it in customer table

        app.getCustomerNo(tempCode).then(data => {

            console.log(tempCode)
            var customerNo = ""

            data.forEach(el => {
                customerNo = el["customerNo"]
            })

            console.log(customerNo)

            //call function to save new client
            app.registerAppUser(dataM.customerName, dataM.customerSurname, dataM.username, dataM.password, dataM.secretQuestion, dataM.temporaryCode, customerNo).then(data => {
                console.log(data)
                if (data["affectedRows"] === 1) {

                    //call function to update database

                    app.updateStatus(tempCode).then(data => {
                        // res.sendStatus(200)
                        res.json({ message: "saved" })
                    })
                }
                if (data["affectedRows"] === 0) {

                    res.json({ message: "failed" })

                }
            }).catch((err) => {

                console.log(err)
            })
        }).catch((err) => {
            console.log(err)
        })

    } catch (err) {
        console.log(err)
    }
})


//user login
router.post('/appauth', (req, res) => {

    //call function to login user
    app.appUserLogin(req.body.username, req.body.password).then((response) => {

        res.json(response)

    }).catch(() => {

        res.sendStatus(503)

    })

})


//change password
router.post('/changepassword', (req, res) => {

    //call funtion to change password

    app.changePaasword(req.body.username, req.body.newpass, req.body.oldpass).then(data => {

        if (data["affectedRows"] === 1) {

            res.json({ message: "changed" })

        } else {
            res.json({ message: "failed" })
        }
    }).catch((err) => {
        console.log(err)
    })
})

//get client details
router.get('/client', (req, res) => {

    //function to geclient details

    try {

        client.getClient(req.query.clientNo).then(data => {

            res.json(data.data)

        }).catch((err) => {
            res.sendStatus(503)
            //console.log(err)

        })

    } catch (err) {
        console.log(err)
    }

})

router.post('/loantransfer', (req, res) => {


    try {
        //fromAccount , toAccount , amount, date
        let data = req.body
        //calculator.myDate(data.date), data.amount, data.fromAccount, data.toAccount

        app.loanRepayment(data.toAccount, data.amount, data.fromAccount, calculator.myDate(data.date)).then(dt => {
            if (dt["status"] === 200) {
                res.json("success")
            } else {
                res.json("failed")
            }
        }).catch(err => {

            console.log(err)

        })

    } catch (err) {
        console.log(err)
    }

})

// make transfer
router.post('/transfer', (req, res) => {

    let data = req.body

    //app.transferMoney(data.fromAccount, data.toAccount, data.amount, calculator.myDate(data.date)).then((data) => {

    //start by making a withdrawal from one account to deposit on another
    app.makeWithdrawal(calculator.myDate(data.date), data.amount, data.fromAccount, data.toAccount).then(dt => {

        if (dt["status"] === 200) {
            //call a function to make a deposit to another account
            app.makeDeposit(calculator.myDate(data.date), data.amount, data.toAccount, data.fromAccount).then(depres => {

                if (depres["status"] === 200) {
                    res.json("success")
                }
            }).catch(err => {
                res.json("failed")
            })
        }
    }).catch(err => {
        res.json("failed")
    })
})

// get a savings account details
router.get('/savingaccountdetails', (req, res) => {

    // get products detail()s
    products.savingsAccount(req.query.accountNo).then(data => {

        res.json(data.data)

    }).catch((err) => {

        console.log(err)

    })


})

// account transfers for a saving account
router.get('/transfers', (req, res) => {

    //get savings tranfers
    app.savingsTranfers().then(data => {

        res.json(data.data)

    }).catch((err) => {
        console.log(err)
    })

})

//get savings transactions  savings
router.get('/transactions', (req, res) => {

    console.log(req.query.accountNo)

    app.getSavingsTransactions(req.query.accountNo).then(data => {

        res.json(data)

        //console.log(data.data)

    }).catch((err) => {
        console.log(err)
    })

})

// all loan details
router.get('/loandetails', (req, res) => {


    try {

        var account = req.query.accountNo
        var accontsCount = 0
        var response = []

        console.log(req.query.loanCount)

        if (req.query.loanCount == 1) {

            // call function to get loan details
            app.loanDetails(req.query.accountNo).then(data => {

                res.json(data.data)

            }).catch((err) => {
                console.log(err)
            })
        }

        if (req.query.loanCount > 1) {

            account.forEach((acc) => {

                // call function to get loan details
                app.loanDetails(acc).then(data => {

                    accontsCount++
                    response.push(data.data)

                    //res.json(data.data)
                    console.log(acc)
                    if (accontsCount === account.length) {
                        res.json(response)
                    }
                }).catch((err) => {
                    console.log(err)
                })
            })
        }

    } catch (err) {
        console.log(err)
    }
})


// loan predictor 
router.post('/loanpredictor', (req, res) => {

    // check flag if its growth or investment
    //investment, periodMonths, rate

    let data = req.body.data

    let tempData = []

    data.forEach((dt) => {

        loan = loanpreditor.loanPredictorIncome(dt["deposit"], dt["months"], dt["interest"], dt["depositPeriod"])

        tempData.push({
            "accountNo": dt["accountNo"],
            "investment": dt["deposit"],
            "months": dt["months"],
            "estimateLoan": loan.toFixed(2)
        })
    })

    res.json(tempData)

})


// statement charge
router.get('/ifhasbeencharged', (req, res) => {

    try {

        let accountNo = req.query.accountNo
        let accountCount = req.query.howmany

        let myAccount = []

        if (accountCount > 1) {

            var searchedCount = 0


            accountNo.forEach((dt) => {

                //call function to check if customer was charged or not
                chargies.checkStatement(dt).then(resp => {

                    searchedCount++

                    resp.forEach(v => {
                        myAccount.push(v["accountNo"])
                    })

                    if (parseInt(searchedCount) === parseInt(accountCount)) {
                        res.json(myAccount)
                    }

                }).catch(err => {
                    console.log(err)
                })
            })
        }

        if (accountCount == 1) {

            chargies.checkStatement(accountNo).then(data => {

                data.forEach(v => {
                    myAccount.push(v["accountNo"])
                    res.json(myAccount)
                })

            }).catch(err => {
                console.log(err)
            })

        }

    } catch (error) {
        console.log(error)
    }
})


// apply charge
router.post('/loanstatementcharge', (req, res) => {

    //statement
    chargies.saveLoanClientCharge(req.body.accountNo, 14, 25.00, calculator.myDate(req.body.date)).then(dt => {

        console.log(dt)
        if (dt["status"] === 200) {
            res.json("success")
        }

    })


})


//add account to database when a request has been made for a statement
router.post('/statementrequestmade', (req, res) => {

    app.recordAccountStatement(req.body.accountNo).then(dt => {

        console.log(dt)

    })
    //recordAccountStatement

})

// messages
router.get('/messages', (req, res) => {

    console.log(req.query.clientID)

    // provide client id
    app.messages(req.query.clientID).then((dt) => {
        res.json(dt)
    })

})

// save read messages 
router.post('/savemessage', (req, res) => {

    app.saveReadMessages(req.body.messageID, req.body.clientID).then(dt => {

        console.log(dt)

    })

})

// read old messages
router.get('/oldmessages', (req, res) => {

    app.oldMessages(req.query.clientID).then(dt => {
        res.json(dt)
    })

})

//get savings transactions
router.get('/savingstransactions', (req, res) => {
    
    app.savingsTrans(req.query.accountNo, req.query.transId).then(dt => {
        
        console.log(dt.data)
        
        if (dt["status"] === 200) {
            
            let transType = "Withholding Tax"
            
            if (dt.data["amount"] === 0.95) {
                transType = "sms"
            }
            
            if (dt.data["amount"] === 18) {
                transType = "Admin Fees"
            }
            
            if (dt.data["amount"] === 10) {
                transType = "EFT"
            }
            
            
            let month
            let day
            
            if (dt.data["submittedOnDate"][1] < 10) {
                
                month = "0" + dt.data["submittedOnDate"][1]
            
            } else {
                month = dt.data["submittedOnDate"][1]
            }
            
            
            if (dt.data["submittedOnDate"][2] < 10) {
                
                day = "0" + dt.data["submittedOnDate"][2]
            
            } else {
                day = dt.data["submittedOnDate"][2]
            }
            
            let newData
            
            if (transType !== "sms") {
                
                newData = {
                    
                    "trans_type": transType,
                    "trans_date": dt.data["submittedOnDate"][0] + "-" + month + "-" + day,
                    "chargies_applied": dt.data["amount"]
                }
                
                res.json(newData)
            
            }
            
            
            
            
            /*
               tempTrans.push({
                "trans_type": "Charge Payment",
                "trans_date": res["submittedOnDate"][0] + "-" + month + "-" + day,
                "chargies_applied": res["amount"]
              })            
            */
        
        
        
        }
    
    
    }).catch(err => {
        console.log(err)
    })
})

// loan repayment schedule
router.post('/loanplan', (req, res) => {
    
    
    let p = req.body.principal
    let n = req.body.loanterm
    
    let interest = 19
    let r = (((interest / 100)) / 12)   //r interest in monthly
    //let n = parseInt(el["loanterm"])  // number of repayments
    
    let repayment = (p) / ((Math.pow((1 + r), n) - (1)) / ((r * (Math.pow((1 + r), n)))))
    
    let loanTotal = repayment * n
    
    let data = {
        "repayment": repayment.toFixed(2),
        "loanAmount": loanTotal.toFixed(2)
    }
    
    res.json(data)

})








module.exports = router