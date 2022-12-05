const headers = require("../modal/header")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();
const db = require('../../db/charge')



// get all savings transactions

let savingsTransactions = async (ClientID, accountNo, interestposting, posteddate, transID) => {
    
    try {
        //ClientID accountNo interestposting posteddate 
        
        return new Promise((resolve, reject) => {
            
            let query = "insert into interestpostings (ClientID, accountNo, interestposting, posteddate , TransactionalID) select ?,?,?,?,?"
                + " where not exists (select TransactionalID from interestpostings where TransactionalID = ?) "
            
            db.query(query, [ClientID, accountNo, interestposting, posteddate, transID, transID], (err, result) => {
                
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

// get values to start processing wiholding tax
let getSaveInterestpostingdetails = async () => {
    
    try {
        
        return new Promise((resolve, reject) => {
            
            let query = "select * from interestpostings where status = 0 limit 1"
            
            db.query(query, [], (err, result) => {
                
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

// calculate withholding tax as charge that is applicable to them
let calculateWithHoldingTax = () => {
    
    try {
        
        
        axios({
            method: 'post',
            url: process.env.url,
            withCredentials: true,
            crossdomain: true,
            //data: $.param(reqData),    
            headers: headers.headers()
        
        })
    
    } catch (error) {
        console.log(error)
    }

}


//create a savings account charge


/*
{
  "chargeId": "2",
  "locale": "en",
  "amount": "100",
  "dateFormat": "dd MMMM yyyy",
  "dueDate": "29 April 2013"
}
*/

//update interestposting if charge has been created 
let updateInterest = async (transID) => {
    
    try {
        
        return new Promise((resolve, reject) => {
            
            let query = "update interestpostings set status = 1 where TransactionalID = ?"
            
            db.query(query, [transID], (err, result) => {
                
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

// add one to date so as to help in posting the transactions of withholding
let addOneDay = async (transID) => {
    
    try {
        
        return new Promise((resolve, reject) => {
            
            let query = "UPDATE interestpostings SET `posteddate` = DATE_ADD(`posteddate` , INTERVAL 1 DAY) where TransactionalID = ? and  status = 0"
            
            db.query(query, [transID], (err, result) => {
                
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


//deleted matured rejected 
let deleteMatured = async (accountNo) => {
    
    try {
        
        return await new Promise((resolve, reject) => {
            
            let query = "delete from interestpostings where accountNo = ?"
            
            db.query(query, [accountNo], (err, result) => {
                
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

module.exports = { savingsTransactions, getSaveInterestpostingdetails, calculateWithHoldingTax, updateInterest, addOneDay, deleteMatured }