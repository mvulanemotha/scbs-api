const headers = require("../modal/header")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();
const db = require('../../db/charge')


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

            let query = "insert into mulaaccounts (accountNo , amount) select ?,? where not exists (select accountNo from mulaaccounts where accountNo = ?) limit 1"

            db.query(query, [accountNo, amount, accountNo], (err, result) => {

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

        let query = "update mulaaccounts set status = 1 where accountNo = ? limit 1"

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
let saveResheduleLoan = async (accountNo, rate) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into loanreshedule (accountNo , rate) select ?,? where not exists (select accountNo from loanreshedule where accountNo = ?) limit 1"

            db.query(query, [accountNo, rate], (err, result) => {

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




module.exports = { updateresheduledLoan, getResheduleLoan, saveResheduleLoan, updateFPtransfer, getFtsavings, ftTosavingsAccount, updateMulaAccounts, getMulaAccount, saveMulaAccounts, runloanPenalty, updateLoanArrears, getLoanArearsDetails, loanArearsDetails, loans, chargies, loanClientDetails, savingsAccount }