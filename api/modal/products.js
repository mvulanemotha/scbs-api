const headers = require("../modal/header")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();
const db = require('../../db/charge');
const clDb = require('../../db/clients')


// gets loans associated with a client
let loans = async () => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "loans",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }

}

// get chargies so as to extract loan chargies  // will be filtred
let chargies = async () => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "charges",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }

}



// get client loan details 
let loanClientDetails = async (loanID) => {

    try {


        return await axios({
            method: "get",
            url: process.env.url + "loans/" + loanID,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }

}


//get a savings account

let savingsAccount = async (accountNo) => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "savingsaccounts/" + accountNo,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }

}

// save loan details in database
// used to calculate penalties for non performing loans

let loanArearsDetails = async (accountNo, principal, interest, overduesincedate, daysInArrears, totalOverDue, maturityDate, loanterm) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into loanpenalties( accountNo , principal , interest ,loanterm , overduesincedate , daysinArrears , totalOverDue , maturityDate ) select ?,?,?,?,?,?,?,?"
                + " "

            db.query(query, [accountNo, principal, interest, loanterm, overduesincedate, daysInArrears, totalOverDue, maturityDate], (err, result) => {

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


// get loan arears details
let getLoanArearsDetails = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from loanpenalties where status = 0 limit 1"

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

//update loan arrears if penalties have been run
let updateLoanArrears = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update loanpenalties set status = 1 where accountNo = ? limit 1"

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

//run penalty on the loan
let runloanPenalty = async (accountNo, amount, date) => {

    try {

        let data = {
            "chargeId": "9",
            "locale": "en",
            "amount": amount,
            "dateFormat": "dd MMMM yyyy",
            "dueDate": date
        }

        return await axios({

            method: "post",
            url: process.env.url + "loans/" + accountNo + "/charges",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
            data: data
        })

    } catch (error) {
        console.log(error)
    }

}

//save mula accounts to help empty them when transfer has been made to clients

let saveMulaAccounts = async (accountNo, amount) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into mulaaccounts (accountNo , amount) select ?,? "//where not exists (select accountNo from mulaaccounts where accountNo = ?) limit 1"

            db.query(query, [accountNo, amount], (err, result) => {

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

//get mula account
let getMulaAccount = async () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from mulaaccounts where status = 0 limit 1"

            db.query(query, (err, result) => {

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

//updsate mual accounts when account has been emptied

let updateMulaAccounts = async (accountNo) => {

    return new Promise((resolve, reject) => {

        let query = "update mulaaccounts set status = 1 where accountNo = ? and status = 0 limit 1"

        db.query(query, [accountNo], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })
    })
}

// store FPSAVINGSTOFIXEDPERIOD
let ftTosavingsAccount = async (fromAccount, toAccount, amount, date) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into fpsavingstofixedperiods (fromAcc, toAccount, amount, tranferDate) select ?,?,?,? where not exists (select fromAcc from fpsavingstofixedperiods where fromAcc = ?) limit 1"

            db.query(query, [fromAccount, toAccount, amount, date, fromAccount], (err, result) => {

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

// get ft account so we can transfer
let getFtsavings = async () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from fpsavingstofixedperiods where status = 0 limit 1"

            db.query(query, (err, result) => {

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

// update when transfered

let updateFPtransfer = async (fromAccount) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "update fpsavingstofixedperiods set status = 1 where fromAcc = ? limit 1"

            db.query(query, [fromAccount], (err, result) => {

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

// reshedule loan

//save loan to be resheduled
let saveResheduleLoan = async (accountNo, rate, month) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into loanreshedule (accountNo , rate, month) select ?,?,? where not exists (select accountNo from loanreshedule where accountNo = ?) limit 1"

            db.query(query, [accountNo, rate, month, accountNo], (err, result) => {

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

// get loan to be resheduled
let getResheduleLoan = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from loanreshedule where status = 0 limit 1"

            db.query(query, (err, result) => {

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

// update resheduled loan
let updateresheduledLoan = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update loanreshedule set status = 1 where accountNo = ?  limit 1"

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


// change rate for laons

let loanReshedule = async (accountNo, rate, month) => {

    try {


        let data = {
            "loanId": accountNo,
            "graceOnPrincipal": 1,
            "rescheduleFromDate": month,
            "dateFormat": "dd MMMM yyyy",
            "locale": "en",
            "recalculateInterest": true,
            "submittedOnDate": "01 December 2022",
            "rescheduleReasonComment": "Interest Rate has changed",
            "newInterestRate": rate,
            "rescheduleReasonId": 454,
            "graceOnInterest": 1,
            "extraTerms": 1
        }

        return await axios({

            method: "post",
            url: process.env.url + "rescheduleloans",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
            data: data
        })

    } catch (error) {
        console.log(error)
    }
}

// loan transctions

let getloansTransactions = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from loantrasactions where accountNo = ?"

            clDb.query(query, [accountNo], (err, result) => {

                if (err) {
                    return reject(err)
                }
                return resolve(result)
            })

        })

    } catch (error) {
        console.log(error.message)
    }

}

//save loan transactions
let saveLoanTransctions = async (accountNo, transaction) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into loantrasactions(accountNo , transaction) select ?, ? where not exists (select transaction from loantrasactions where transaction = ?)"

            clDb.query(query, [accountNo, transaction, transaction], (err, result) => {

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

//get prepay details
let prePayment = async (accountNo) => {

    try {

        return await axios({

            method: "get",
            //url: "https://api.live.irl.musoniservices.com/v1/loans/" + accountNo + "?associations=all", //process.env.url + "rescheduleloans",
            url: "https://api.live.irl.musoniservices.com/v1/loans/" + accountNo + "?associations=all",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
        })

    } catch (error) {
        console.log(error.message)
    }

}



module.exports = { prePayment, getloansTransactions, getLoanArearsDetails, saveLoanTransctions, loanReshedule, updateresheduledLoan, getResheduleLoan, saveResheduleLoan, updateFPtransfer, getFtsavings, ftTosavingsAccount, updateMulaAccounts, getMulaAccount, saveMulaAccounts, runloanPenalty, updateLoanArrears, getLoanArearsDetails, loanArearsDetails, loans, chargies, loanClientDetails, savingsAccount }