const express = require("express");
const router = express.Router();
const app = require("../modal/app")
const calculator = require("../modal/calculator")
const sms = require('../modal/sms')
const client = require('../modal/clients')
const products = require('../modal/products')
const loanpreditor = require('../modal/loanpredictor')
const authModal = require('../modal/auth')
const chargies = require('../modal/charge')
const jwt = require('jsonwebtoken')
var CryptoJS = require("crypto-js");


//get all enquiries
router.get('/all', async (req, res) => {
    
    await app.getAllEnquries().then((data) => {

        res.status(200).json(data)

    })

})

//update enquiries
router.put('/', async (req, res) => {
    
    //update inquire
    await app.updateEnquire(req.body.no, req.body.status, req.body.scbsEmployee).then(data => {
        
        res.status(200).json(data)
    
    }).catch(err => {

        console.log(err)

    })

})


//delete enquire
router.post('/inquiredelete', authModal.ensureToken, async (req, res) => {

    await app.deleteEnquire(req.body.no).then((data) => {

        if (data.affectedRows === 1) {
            res.status(200).json({ "message": "deleted" })
        } else {
            res.json({ "message": "failed" })
        }

    })

})

//get client enquire
router.get('/inquire', authModal.ensureToken, async (req, res) => {


    await app.getMyInquire(req.query.ClientNo).then((data) => {

        res.status(200).json(data)

    })

})

//save inquire in the database
router.post('/inquire', authModal.ensureToken, async (req, res) => {

    let inquire = CryptoJS.AES.decrypt(req.body.inquire, process.env.encycriptionKey)
    let title = CryptoJS.AES.decrypt(req.body.title, process.env.encycriptionKey)
    let name = CryptoJS.AES.decrypt(req.body.name, process.env.encycriptionKey)
    let userAccount = CryptoJS.AES.decrypt(req.body.userAccount, process.env.encycriptionKey)

    name = name.toString(CryptoJS.enc.Utf8)
    inquire = inquire.toString(CryptoJS.enc.Utf8)
    title = title.toString(CryptoJS.enc.Utf8)
    clientNo = userAccount.toString(CryptoJS.enc.Utf8)

    //save in database
    await app.saveInquire(clientNo, name, title, inquire).then(data => {

        if (data.affectedRows === 1) {
            res.json({ message: "saved" })
        } else {
            res.json({ message: "failed" })
        }

    }).catch(err => {
        console.log(err.message)
    })



})


//router to get all clients accounts
router.get('/clients_accounts', authModal.ensureToken, (req, res) => {

    let clientNo = req.query.clientNo

    app.clientAccounts(clientNo).then(data => {

        res.json(data.data)

    }).catch(error => {
        console.log(error)
    })

})


// apply for a loan
router.post('/apply_for_loan', authModal.ensureToken, (req, res) => {

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
    
    }).catch((err) => {

        res.sendStatus(err)

    })

})

//register a new application user
router.post('/register', (req, res) => {

    let dataM = req.body

    let password = CryptoJS.AES.decrypt(dataM["password"], process.env.encycriptionKey)
    let username = CryptoJS.AES.decrypt(dataM["username"], process.env.encycriptionKey)
    let temporaryCode = CryptoJS.AES.decrypt(dataM["temporaryCode"], process.env.encycriptionKey)

    password = password.toString(CryptoJS.enc.Utf8)
    username = username.toString(CryptoJS.enc.Utf8)
    temporaryCode = temporaryCode.toString(CryptoJS.enc.Utf8)


    try {
        //get client number from a customerNo table then include it in customer table

        app.getCustomerNo(temporaryCode).then(data => {

            var customerNo = ""

            data.forEach(el => {
                customerNo = el["customerNo"]
            })

            //call function to save new client
            app.registerAppUser("SCBS", "SCBS", username, password, "BLUE", temporaryCode, customerNo).then(data => {

                if (data["affectedRows"] === 1) {

                    //call function to update database
                    app.updateStatus(temporaryCode).then(data => {
                        // res.sendStatus(200)
                        res.json({ message: "saved" })
                    })
                }
                if (data["affectedRows"] === 0) {

                    res.json({ message: "failed" })

                }
            }).catch((err) => {

                res.json({ message: "failed" })
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


    try {

        let username = req.body.username
        let password = req.body.password
        //encycriptionKey
        let cusername = CryptoJS.AES.decrypt(username, process.env.encycriptionKey)
        let cpassword = CryptoJS.AES.decrypt(password, process.env.encycriptionKey)

        username = cusername.toString(CryptoJS.enc.Utf8)
        password = cpassword.toString(CryptoJS.enc.Utf8)


        // get login attempts for a login
        app.getLoginAttempts(username).then((attempts) => {

            //var loginAttempts = 0

            attempts.forEach(at => {
                loginAttempts = parseInt(at["attempts"])
            })

            // if the lenght is zero means no username was found
            if (attempts.length === 0) {
                res.json({ message: "Login Failed" })
                return
            }

            attempts.forEach((el) => {
                let attempts = el["attempts"]

                if (parseInt(attempts) === 3) {
                    res.json({ message: "locked" })
                    return
                }

                if (parseInt(attempts) !== 3) {

                    //call function to login user
                    app.appUserLogin(username, password).then((response) => {

                        console.log("Im in")
                        //lets check if login failed to update login attempts
                        if (response.length === 0) {

                            // call update function to update attempts
                            app.loginAttempts(username)

                            res.json({ message: "Login Failed" })

                        } else {

                            app.resetAttempts(username)

                            let newResponse = response

                            newResponse.push({ token: jwt.sign({ username }, process.env.jwt_token_key) })

                            res.json(newResponse)
                        }

                    }).catch((errr) => {
                        console.log(errr)
                        //res.sendStatus(503)
                    })

                } else {
                }
            })
        }).catch(errrr => {
            console.log(errrr)
        })

    } catch (error) {
        console.log(error)
    }
})


//change password
router.post('/changepassword', (req, res) => {

    //call funtion to change password

    let username = CryptoJS.AES.decrypt(req.body.username, process.env.encycriptionKey)
    let newpass = CryptoJS.AES.decrypt(req.body.newpass, process.env.encycriptionKey)
    let oldpass = CryptoJS.AES.decrypt(req.body.oldpass, process.env.encycriptionKey)
    
    username = username.toString(CryptoJS.enc.Utf8)
    newpass = newpass.toString(CryptoJS.enc.Utf8)
    oldpass = oldpass.toString(CryptoJS.enc.Utf8)
    

    app.changePaasword(username, newpass, oldpass).then(data => {

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
router.get('/client', authModal.ensureToken, (req, res) => {

    //function to geclient details

    try {

        client.getClient(req.query.clientNo).then(data => {

            res.json(data.data)

        }).catch((err) => {

            res.sendStatus(503)
        })

    } catch (err) {
        console.log(err)
    }

})

router.post('/loantransfer', authModal.ensureToken, (req, res) => {


    try {
        //fromAccount , toAccount , amount, date
        let data = req.body
        //calculator.myDate(data.date), data.amount, data.fromAccount, data.toAccount

        app.loanRepayment(data.toAccount, data.amount, data.fromAccount, calculator.myDate(data.date)).then(dt => {
            if (dt["status"] === 200) {

                // call function to do a withdrawal from the savings account

                //start by making a withdrawal from one account to deposit on another
                app.makeWithdrawal(calculator.myDate(data.date), data.amount, data.fromAccount, data.toAccount).then(withdrwalRes => {

                    if (dt["status"] === 200) {
                        res.json("success")
                    }
                })
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
router.post('/transfer', authModal.ensureToken, (req, res) => {

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
router.get('/savingaccountdetails', authModal.ensureToken, (req, res) => {

    // get products detail()s
    products.savingsAccount(req.query.accountNo).then(data => {

        res.json(data.data)

    }).catch((err) => {

        console.log(err)

    })


})

// account transfers for a saving account
router.get('/transfers', authModal.ensureToken, (req, res) => {

    //get savings tranfers
    app.savingsTranfers().then(data => {

        res.json(data.data)

    }).catch((err) => {
        console.log(err)
    })

})

//get savings transactions  savings
router.get('/transactions', authModal.ensureToken, (req, res) => {

    console.log(req.query.accountNo)

    app.getSavingsTransactions(req.query.accountNo).then(data => {

        res.json(data)

        //console.log(data.data)

    }).catch((err) => {
        console.log(err)
    })

})

// all loan details
router.get('/loandetails', authModal.ensureToken, (req, res) => {


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
router.post('/loanpredictor', authModal.ensureToken, (req, res) => {

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
router.get('/ifhasbeencharged', authModal.ensureToken, (req, res) => {

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
router.post('/loanstatementcharge', authModal.ensureToken, (req, res) => {

    //statement
    chargies.saveLoanClientCharge(req.body.accountNo, 18, 5.00, calculator.myDate(req.body.date)).then(dt => {

        console.log()

        if (dt["status"] === 200) {
            res.json("success")
        }

    }).then(err => {

        console.log(err)

    })


})


//add account to database when a request has been made for a statement
router.post('/statementrequestmade', authModal.ensureToken, (req, res) => {

    app.recordAccountStatement(req.body.accountNo).then(dt => {

        console.log(dt)

    })
    //recordAccountStatement

})

// messages
router.get('/messages', authModal.ensureToken, (req, res) => {

    console.log(req.query.clientID)

    // provide client id
    app.messages(req.query.clientID).then((dt) => {
        res.json(dt)
    })

})

// save read messages 
router.post('/savemessage', authModal.ensureToken, (req, res) => {

    app.saveReadMessages(req.body.messageID, req.body.clientID).then(dt => {
        
        console.log(dt)

    })

})

// read old messages
router.get('/oldmessages', authModal.ensureToken, (req, res) => {

    app.oldMessages(req.query.clientID).then(dt => {
        res.json(dt)
    })

})


//create a small service that will  update 0 chargies from the database
/*
setInterval(() => {

    //get data from database that has zero charge

    try {

        app.zeroCharge().then(data => {

            //console.log(data)

            data.forEach((dt) => {

                app.savingsTrans(dt["accountNo"], dt["tran_id"]).then(res => {


                    if (res["status"] === 200) {

                        let transType = "Withholding Tax"

                        let amountGot = res.data["amount"]

                        if (res.data["amount"] === 0.95) {
                            transType = "sms"
                        }

                        if (res.data["amount"] === 18) {
                            transType = "Admin Fees"
                        }

                        if (res.data["amount"] === 10) {
                            transType = "EFT"
                        }

                        console.log(amountGot)
                        //call function to update the database

                        app.updateZeroCharge(dt["tran_id"], transType, amountGot).then(tranformed => {

                            if (parseInt(tranformed["affectedRows"]) === 1) {
                                console.log("Done")
                            } else {
                                console.log("failed")
                            }

                        }).catch(errr => {
                            console.log(errr)
                        })
                    }
                })
            })
        })

    } catch (err) {
        console.log(err)
    }

}, 4000);
*/




//get savings transactions
router.get('/savingstransactions', authModal.ensureToken, (req, res) => {

    app.savingsTrans(req.query.accountNo, req.query.transId).then(dt => {

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
                console.log(newData)
                res.json(newData)

            }

        }


    }).catch(err => {
        console.log(err)
    })
})

// loan repayment schedule
router.post('/loanplan', authModal.ensureToken, (req, res) => {


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

// get tempcode 
router.get("/tempcode", (req, res) => {

    // call function to get tempcode

    let temp_code = req.query.tempCode

    app.getTempcode(temp_code).then(data => {

        console.log(data)

        if (data.length === 1) {
            data.forEach(dt => {
                
                if (dt["status"] === 0) {
                    res.json({ tempcode: dt["temporaryCode"], status: "Registered" })
                } else {

                    res.json({ tempcode: dt["temporaryCode"], status: "Un Registered" })
                }
            })
        } else {
            res.json({ tempcode: "NOT FOUND", status: "NOT FOUND" })
        }
    })
})


module.exports = router