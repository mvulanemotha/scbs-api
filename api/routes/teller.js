const express = require("express");
const router = express.Router();
const products = require('../modal/products')
const teller = require('../modal/teller')
const calculator = require("../modal/calculator")
const transactions = require('../modal/charge')
const denoms = require('../modal/demons')


//get a savings details

router.get('/', (req, res) => {

    //savings account details

    //console.log(req.query.accountNo)

    products.savingsAccount(req.query.accountNo).then(data => {
        if (data === undefined) {
            res.json({ message: "Account Not Found" })
        } else {
            res.json(data.data)
        }

    })


})

// make deposit
router.post("/deposit", async (req, res) => {

    let data = req.body.data

    let username = req.body.username
    let password = req.body.password

    let accountNo = data.accountNo

    let date = data.date
    let tellerusername = data.teller

    await teller.deposite(data.accountNo, calculator.myDate(data.date), data.amount, "ZULWINI", data.receiptNo, username, password).then(data => {

        if (data.data !== undefined) {


            let sdata = data.data

            teller.saveWithdrawalTransaction(tellerusername, sdata["clientId"], sdata["savingsId"], sdata["resourceId"], sdata["changes"]["accountNumber"], sdata["changes"]["transactionAmount"], sdata["changes"]["receiptNumber"], "deposit", date)

            let innerData = data.data
            // get transaction so that we can get the balance
            let TransactionalID = innerData["savingsAccountTransactionId"]

            // get transaction so that an sms can be sent to a client
            transactions.transactions(accountNo, TransactionalID).then(data => {

                //console.log(data)
                if (data.data !== undefined) {

                    let balance = data.data

                    //
                    res.json({ balance: balance["runningBalance"], transid: TransactionalID })

                }

            })

        } else {

            res.json({ message: "FAILED TO SAVE" })

        }
    }).catch(err => {
        console.log(err.message)
    })
})


//make a withdrawal
router.post("/withdraw", async (req, res) => {

    try {

        let data = req.body.data
        let username = req.body.username
        let password = req.body.password


        let accountNo = data.accountNo

        let date = data.date
        let tellerusername = data.teller



        await teller.withdrawalTransaction(data.accountNo, data.amount, calculator.myDate(data.date), data.receiptNo, username, password).then(data => {


            if (data.data !== undefined) {


                //save a withdrawal or deposit transactions

                let sdata = data.data

                teller.saveWithdrawalTransaction(tellerusername, sdata["clientId"], sdata["savingsId"], sdata["resourceId"], sdata["changes"]["accountNumber"], sdata["changes"]["transactionAmount"], sdata["changes"]["receiptNumber"], "withdrawal", date)


                let innerData = data.data
                // get transaction so that we can get the balance
                let TransactionalID = innerData["resourceId"]

                // get transaction so that an sms can be sent to a client
                transactions.transactions(accountNo, TransactionalID).then(data => {


                    if (data.data !== undefined) {

                        let balance = data.data
                        //
                        res.json({ balance: balance["runningBalance"], transid: TransactionalID })

                    }

                })

            } else {

                res.json({ message: "FAILED TO SAVE" })

            }



        }).catch((error) => {
            console.log(error.message)
        })
    } catch (err) {
        console.log(err)
    }

})


//retrieve cashier transactions
router.post('/transactions', (req, res) => {

    try {
        let user = req.body.teller
        let date = req.body.date

        teller.tellerTransDatabase(user, date).then((data) => {

            if (data !== undefined) {
                res.json(data)
            }

        })
    } catch (err) {
        console.log(err)
    }
})

// get teller balance from Musoni

router.get('/balance', async (req, res) => {

    let transId = req.query.transID
    let cashierID = req.query.cashierID
    let tellerID = req.query.tellerID


    console.log(tellerID)
    console.log(cashierID)

    /*
    //let username = req.query.username // no need of a username
    let transId = req.query.transID
    let cashierID = req.query.cashierID
    let tellerID = req.query.tellerID

    console.log(tellerID)
    console.log(cashierID)

    // get teller transaction to get the balance
    await teller.tellerTransactions(tellerID, cashierID).then((data) => {

        console.log(data)

        let dataTrans = data.data

        dataTrans = dataTrans["pageItems"]

        //console.log(dataTrans)
        //console.log(dataTrans)
        //console.log(transId)
        let dataTran = dataTrans.filter(dt => dt["entityId"] === Number(transId))


        //console.log(dataTran)
        res.json({ balance: dataTran[0]["runningBalance"] })

    })

    */
})

router.get('/balancesummary', async (req, res) => {

    let cashierID = req.query.cashierID
    let tellerID = req.query.tellerID


    console.log(cashierID + "Cashier")
    console.log(tellerID + "Teller")

    /*
    await teller.tellerSummary(tellerID, cashierID).then((data) => {

        console.log(data)

        
        if (data.data !== undefined) {
            res.json(data.data)
        }
        
    
    }).catch(errr => {

        console.log(errr.message)

    })
    */

})

//  get all tellers 
router.get('/tellers', (req, res) => {


    //get tellers then get cashiers
    teller.getTellers().then(data => {

        //get data lenght
        let foundTellers = data.data

        res.json(foundTellers)
    
    }).catch((error) => {
        console.log(error)
    })
})

// teller balances

router.get('/tellerbalances', async (req, res) => {

    await denoms.sumTodayBalances(req.query.date).then((data) => {

        res.json(data)

    })
})


router.post('/settleTeller', async (req, res) => {

    await teller.settleTeller(3, 18, 10500).then(data => {

        console.log(data)

    })

})



module.exports = router