const headers = require("../modal/header")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();
const db = require("../../db/charge");


//make a deposite
let deposite = async (accountNo, date, amount, bank, receipt, username, password) => {

    try {


        let data = {

            "locale": "en",
            "dateFormat": "dd MMMM yyyy",
            "transactionDate": date,
            "transactionAmount": amount,
            "paymentTypeId": 177,
            "accountNumber": accountNo,
            ///"checkNumber": "che123",
            //"routingCode": "rou123",
            "receiptNumber": receipt,
            //"bankNumber": bank

        }
        
        return await axios({

            method: "post",
            url: process.env.url + "savingsaccounts/" + accountNo + "/transactions?command=deposit",
            withCredentials: true,
            crossdomain: true,
            headers: headers.tellerHeaders(username, password),
            data: data

        })

    } catch (error) {
        console.log(error)
    }

}

//make a withdrawal

let withdrawalTransaction = async (accountNo, amount, date, receipt, username, password) => {

    try {

        let data = {

            "locale": "en",
            "dateFormat": "dd MMMM yyyy",
            "transactionDate": date,
            "transactionAmount": amount,
            "paymentTypeId": 177,
            "accountNumber": accountNo,
            "checkNumber": "che123",
            "routingCode": "rou123",
            "receiptNumber": receipt
            //"bankNumber": "ban123"

        }


        return await axios({

            method: "post",
            url: process.env.url + "savingsaccounts/" + accountNo + "/transactions?command=withdrawal",
            withCredentials: true,
            crossdomain: true,
            headers: headers.tellerHeaders(username, password),
            data: data
        })

    } catch (error) {
        console.log(error)
    }

}

//create teller transactions

let tellerTransactions = async (tellerID, cashierId) => {

    try {


        return await axios({

            method: "get",
            url: process.env.url + "tellers/" + tellerID + "/cashiers/" + cashierId + "/transactions",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        }).catch((err) => {
            console.log(err)
        })

    } catch (error) {
        console.log(error)
    }

}


//save a withrawal or deposit transaction

let saveWithdrawalTransaction = async (teller, clientId, savingsId, tranid, accountNo, amount, receiptNo, type, date) => {

    try {

        return await new Promise((resolve, reject) => {
            //	clientId	savingsId	transId	accountNo	amount	receiptNo	

            let query = " insert into withdrawaldeposittransactions (teller,clientId,savingsId,transId,accountNo,amount,receiptNo, type ,date) select ?,?,?,?,?,?,?,?,? "


            db.query(query, [teller, clientId, savingsId, tranid, accountNo, amount, receiptNo, type, date], (err, result) => {

                if (err) {
                    return reject(err)
                }

                return resolve(result)

            })

        })

    } catch (error) {
        console.log(error)
    }

}


// get transactions
let tellerTransDatabase = async (teller, date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from withdrawaldeposittransactions where teller = ? and date = ?"

            db.query(query, [teller, date], (err, result) => {

                if (err) {
                    return reject(err)
                }

                return resolve(result)

            })

        })

    } catch (error) {
        console.log(error)
    }

}



// teller summary
let tellerSummary = async (tellerID, cashierId) => {

    try {


        return await axios({

            method: "get",
            url: process.env.url + "tellers/" + tellerID + "/cashiers/" + cashierId + "/summaryandtransactions",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        }).catch((err) => {
            console.log(err)
        })

    } catch (error) {
        console.log(error)
    }

}

// list tellers
let getTellers = async () => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "tellers/",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()

        })

    } catch (error) {
        console.log(error)
    }

}


//get cashiers
let getCashiers = async (tellerID) => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "tellers/" + tellerID + "/cashiers",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()

        })

    } catch (error) {
        console.log(error)
    }

}



module.exports = { deposite, withdrawalTransaction, tellerTransactions, saveWithdrawalTransaction, tellerTransDatabase, tellerSummary, getTellers, getCashiers }