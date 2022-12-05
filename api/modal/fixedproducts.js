const db = require('../../db/charge')
const headers = require("../modal/header")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();



// save deposits
let deposists = async (clientId, accountNo, deposit, name, date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into fixedperioddeposits (clientId ,accountNo , deposit , name , date) select ?,?,?,?,? "
                + "from dual where not exists ( select accountNo , clientId from fixedperioddeposits where accountNo = ? and clientId = ?)"

            db.query(query, [clientId, accountNo, deposit, name, date, accountNo, clientId], (err, result) => {
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

// get deposists
let getDeposits = async (accountNo, clientId) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from fixedperioddeposits where accountNo = ? and clientId = ?"

            db.query(query, [accountNo, clientId], (err, result) => {

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

//save interstpostings for the customer
let saveInterestpostings = async (clientId, accountNo, interestposting, name, date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into fixedperioddepositsinterestpostings (clientId, accountNo , interestposting , name , date) select ?,?,?,?,? from dual where not exists"
                + "(select accountNo , clientId from fixedperioddepositsinterestpostings where accountNo = ? and clientId = ? and date = ?)"
            
            db.query(query, [clientId, accountNo, interestposting, name, date, accountNo, clientId , date], (err, result) => {
                
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

// get ineterst postings
let getInterestPostings = async (accountNo, clientId) => {

    try {

        return await new Promise((resolve, reject) => {
            
            let query = "select * from fixedperioddepositsinterestpostings  where accountNo = ?  and clientId = ?"

            db.query(query, [accountNo, clientId], (err, result) => {

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

//get fixed product details from musoni
let getFixedPositeDetails = async(accountNo) => {
    
    try {

        return await axios({

            method: "get",
            url: process.env.url + "fixeddepositaccounts/" + accountNo,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })
    
    } catch (error) {
        console.log(error)
    }

}




module.exports = { deposists, getDeposits, saveInterestpostings, getInterestPostings , getFixedPositeDetails }

