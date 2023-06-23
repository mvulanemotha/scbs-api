const express = require("express");
const router = express.Router();
const transactions = require('../modal/charge');
const app = require('../modal/app')
const loantransactions = require('../modal/products')


router.get('/', (req, res) => {


    let accountNo = req.query.account
    let tranid = req.query.transID

    //console.log(req)

    //get a client transaction from muson
    transactions.loanTransactions(accountNo, tranid).then(data => {

        if (data === undefined) {
            res.json("NOT FOUND")
        } else {
            res.json(data.data)
        }
    })
})

//get savings transactions
router.get('/savings', (req, res) => {


    try {


        transactions.transactions(req.query.accountNo, req.query.transID).then((data) => {

            console.log(data.data)

        }).catch((error) => {
            console.log(error);
        })

    } catch (error) {
        console.log(error)
    }
})


//transactions for developers
//store all transactions
router.post('/storetransactions', (req, res) => {

    //get function to store transactions

    let data = req.body.data

    data.forEach(el => {

        app.transactions(el["accountNo"], el["charge"], el["chargewaived"], el["Deposit"], el["date"], el["interestposting"], el["transfered"], el["productName"], el["Reversed"],
            el["transId"], el["transType"], el["transAmount"], el["withdrawal"]).then((response) => {

                //if(response["aff"])
                console.log(response)

            }).catch((err) => {

                console.log(err)
                return

            })
    });
})

// save loans transactions 
router.post('/storeloantransactions', (req, res) => {

    let data = req.body.data

    let datasize = data.length
    let savedCount = 0
    let innerCount = 0

    data.forEach(async el => {

        await loantransactions.saveLoanTransctions(el["accountNo"], el["transaction"]).then((saved) => {

            innerCount++

            if (saved["affectedRows"] === 1) {

                savedCount++

            }

            if (innerCount === datasize) {

                if ((savedCount < datasize) && (savedCount > 0)) {
                    res.json({ "message": "Some Transactions have been saved" })
                }

                if (savedCount === datasize) {
                    res.json({ "message": "Transactions Saved" })
                }

                if (savedCount === 0) {
                    res.json({ "message": "Transactions are uptodate" })
                }

            }
        })
    })
})

//get loan transactions
router.get('/getloantransactions', async (req, res) => {

    let account = req.query.accountNo

    await loantransactions.getloansTransactions(account).then(data => {

        res.json(data)

    })


})


module.exports = router;