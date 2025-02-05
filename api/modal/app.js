const db = require('../../db/clients')
const db2 = require('../../db/charge')
const dotenv = require('dotenv');
const { default: axios } = require('axios');
const headers = require('../modal/header');
const nodemailer = require('nodemailer')

dotenv.config();


//get all accounts of client using client account number

let clientAccounts = async (clientNo) => {


    return await axios({

        method: "get",
        url: process.env.url + "clients/" + clientNo + "/accounts",
        withCredentials: true,
        crossdomain: true,
        headers: headers.headers()
    })

}

// apply for a loan

let loanApplication = async (clientNo, amount, submittedDate, repaymentDate, disbursementDate, loanId, loanDuration) => {




    let data = {

        "dateFormat": "dd MMMM yyyy",
        "locale": "en_GB",
        "clientId": clientNo,
        "productId": loanId,
        "principal": amount,
        "loanTermFrequency": loanDuration,
        "loanTermFrequencyType": 2,
        "loanType": "individual",
        "numberOfRepayments": loanDuration,
        "repaymentEvery": 1,
        "repaymentFrequencyType": 2,
        "interestRatePerPeriod": 19,
        "amortizationType": 1,
        "interestType": 0,
        "interestCalculationPeriodType": 1,
        "transactionProcessingStrategyId": 1,
        "repaymentsStartingFromDate": repaymentDate,
        "expectedDisbursementDate": disbursementDate,
        "submittedOnDate": submittedDate

    }

    return await axios({

        method: "post",
        url: process.env.url + "loans/",
        withCredentials: true,
        crossdomain: true,
        data: data,
        headers: headers.headers()
    })
}


//save all clients to the database 
let saveCustomers = async (customerNo, temporaryCode, contact) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into customerno(customerNo , temporaryCode , contact) select ?,?,? from dual where not exists (select customerNo from customerno where customerNo = ?)"

            db.query(query, [customerNo, temporaryCode, contact, customerNo], (err, result) => {

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


// get clients Numbers to be sent to customers and register with them
// will be used to send sms to clients

let getClientsCodes = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from customerno where sent = 0 limit 1"

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

//update when email has been sent
let updateEmailsent = async (tempcode) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customerno set sent = 1 where temporaryCode = ? limit 1"

            db.query(query, [tempcode], (err, result) => {

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


//get customer table
let getCustomerNo = async (temporaryCode) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select customerNo from customerno where temporaryCode = ? limit 1"

            db.query(query, [temporaryCode], (error, result) => {

                if (error) {
                    return reject(error)
                }
                return resolve(result)
            })

        })

    } catch (error) {
        console.log(error)
    }

}



//register a user for the app
let registerAppUser = async (name, surname, username, password, secretAnswer, temporaryCode, customerNo) => {



    return await new Promise((resolve, reject) => {

        let query = "insert into customers(name, surname, username , password , secretAnswer , customerNo) select ?,?,?,?,?,? "
            + " from dual where exists ( select temporaryCode from customerno where temporaryCode = ? and status = 1) limit 1 "

        db.query(query, [name, surname, username, password, secretAnswer, customerNo, temporaryCode], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })
    })



}

// update status to 0 when a customer has been registered  // for temporary code
let updateStatus = async (tempCode) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customerno set status = 0 where temporaryCode = ? limit 1"

            db.query(query, [tempCode], (err, result) => {

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

//login

let appUserLogin = async (username, password) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select cu.name as name , cu.surname as surname, cu.customerNo as code from customers as cu where cu.username = ? and cu.password = ? limit 1"

            db.query(query, [username, password], (err, result) => {

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

//change password
let changePaasword = async (username, newpass, oldpass) => {

    try {


        return await new Promise((resolve, reject) => {

            let query = "update customers set password = ? where password = ? and username = ? limit 1"

            db.query(query, [newpass, oldpass, username], (err, result) => {

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

//account transfers
let transferMoney = async (fromAccount, toAccount, amount, date, clientID) => {

    try {

        console.log(clientID)


        let data = {

            "fromOfficeId": 2,
            "fromClientId": 783,
            "fromAccountType": 2,
            "fromAccountId": 1166,//fromAccount,
            "toOfficeId": 2,
            "toClientId": 783,
            "toAccountType": 2,
            "toAccountId": 1193,//toAccount,
            "dateFormat": "dd MMMM yyyy",
            "locale": "en",
            "transferDate": date,
            "transferAmount": amount,
            "transferDescription": "Doing savings"

        }

        return await axios({

            method: "post",
            url: process.env.url + "accounttransfers",
            withCredentials: true,
            crossdomain: true,
            data: data,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }
}


// savings tranfers

let savingsTranfers = async () => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "accounttransfers",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }
}

//save transactions


let transactions = async (accountNo, chargies_applied, chargies_waived, deposit, trans_date, interest_posting, is_account_transfer, product_name,
    reversed, tran_id, trans_type, transfer_amount, withdrawal) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into transactions (accountNo ,chargies_applied "
                + " ,chargies_waived ,deposit ,trans_date ,interest_posting ,is_account_transfer,"
                + " product_name ,reversed ,tran_id ,trans_type, transfer_amount ,withdrawal) "
                + " select ?,?,?,?,?,?,?,?,?,?,?,?,? "
                + " where not exists ( select tran_id from transactions where tran_id = ? ) limit 1 "

            db.query(query, [accountNo, chargies_applied, chargies_waived, deposit, trans_date, interest_posting, is_account_transfer, product_name,
                reversed, tran_id, trans_type, transfer_amount, withdrawal, tran_id], (err, result) => {

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


// get a product transactions

let getSavingsTransactions = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from transactions where accountNo = ?"

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

// loan details

let loanDetails = async (accountNo) => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "loans/" + accountNo,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })


    } catch (error) {
        console.log(error)
    }
}


// save when statement has alredy been request so we cn charge future statements
let recordAccountStatement = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into loanstatementcharge (accountNo) select ? where not exists (select accountNo from loanstatementcharge where accountNo = ? ) limit 1"

            db2.query(query, [accountNo, accountNo], (err, result) => {

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

// get messages
let messages = async (clientID) => {

    try {

        return await new Promise((resolve, reject) => {

            //reading new message    
            let query = "select * from message"//where No not in (select message_id from readmesages where clientId = ?)"

            db.query(query, [clientID], (err, result) => {

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

// read old messages
let oldMessages = async (clientID) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from message"//where No in (select message_id from readmesages where clientId = ?)"

            db.query(query, [clientID], (err, result) => {

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



//save read messages
let saveReadMessages = (message_id, clientId) => {

    try {

        return new Promise((resolve, reject) => {

            let query = 'insert into readmesages(clientId,message_id) select ?,? where not exists (select clientId , message_id from readmesages where clientId = ? and message_id =?) limit 1'

            db.query(query, [clientId, message_id, clientId, message_id], (err, result) => {

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

// loan repayment

let loanRepayment = async (accountNo, amount, fromAccount, transferDate) => {

    try {

        let data = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en",
            "transactionDate": transferDate,
            "transactionAmount": amount,
            "paymentTypeId": 218,
            "note": "check payment",
            "accountNumber": accountNo,
            "checkNumber": "che123",
            "routingCode": "rou123",
            "receiptNumber": "Payment from " + fromAccount,
            "bankNumber": "ban123"
        }

        return await axios({

            method: "post",
            url: process.env.url + "loans/" + accountNo + "/transactions?command=repayment",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
            data: data
        })

    } catch (error) {
        console.log(error)
    }

}

// make a deposit 
let makeDeposit = async (depositDate, amount, accountNo, fromAccount) => {

    try {

        let data = {
            "locale": "en",
            "dateFormat": "dd MMMM yyyy",
            "transactionDate": depositDate,
            "transactionAmount": amount,
            "paymentTypeId": 177,
            "accountNumber": accountNo,
            // "checkNumber": "che123",
            // "routingCode": "rou123",
            "receiptNumber": "From " + fromAccount,
            "bankNumber": "scbs"
        }

        return await axios({

            method: "post",
            url: process.env.url + "savingsaccounts/" + accountNo + "/transactions?command=deposit",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
            data: data

        })

    } catch (error) {
        console.log(error)
    }

}

// make a deposit 
let makeWithdrawal = async (withrawalDate, amount, accountNo, toAccount) => {

    try {


        let data = {
            "locale": "en",
            "dateFormat": "dd MMMM yyyy",
            "transactionDate": withrawalDate,
            "transactionAmount": amount,
            "paymentTypeId": 218,
            "accountNumber": accountNo,
            // "checkNumber": "che123",
            // "routingCode": "rou123",
            "receiptNumber": toAccount,
            "bankNumber": "scbs"
        }

        return await axios({

            method: "post",
            url: process.env.url + "savingsaccounts/" + accountNo + "/transactions?command=withdrawal",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),
            data: data

        })

    } catch (error) {
        console.log(error)
    }

}


// get clients transactions for a saving account
let savingsTrans = async (accountNo, tran_id) => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "savingsaccounts/" + accountNo + "/transactions/" + tran_id,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers(),

        })

    } catch (error) {
        console.log(error)
    }
}

// update attempts in database
let loginAttempts = async (username) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customers set attempts = attempts + 1 where username = ? limit 1"

            db.query(query, [username], (err, result) => {
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

// get login attempts
let getLoginAttempts = async (username) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from customers where username = ? limit 1"

            db.query(query, [username], (err, result) => {

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

//reset attemps on login
let resetAttempts = async (username) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customers set attempts = 0 where username = ? limit 1"

            db.query(query, [username], (err, result) => {

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

// send email to make a reset
// NOT USED CURRENTLY
let resetPassEmail = async (username) => {

    try {

        //use get login attempts to get customer number so that we cn then get an email from core banking
        getLoginAttempts(username).then(email => {

            if (email.length !== 0) {

                email.forEach(el => {

                    //console.log(el["customerNo"])
                    return el["customerNo"]

                })
            }
        })

    } catch (error) {
        console.log(error)
    }

}

let alertIT = (contact, email) => {

    var transporter = nodemailer.createTransport({

        //service: "Outlook365",
        host: 'smtp.googlemail.com',                  // hostname
        //service: 'outlook', 
        port: 465,
        secure: true,
        //requireTLS: true,
        auth: {
            user: "statuscapitalit@gmail.com",
            pass: 'guxb tdld yzot kict'
            //user: 'mkhululi.motha@scbs.co.sz',
            //pass: 'Qus29753'
        }/*,
            tls:
            {
                "ciphers": 'SSLv3',
                rejectUnauthorized: false
            }*/
    })

    transporter.sendMail({

        from: {
            name: 'Customer App',
            address: 'it@scbs.co.sz' //process.env.frommail
        },
        to: ['mkhululi.motha@scbs.co.sz'],
        subject: 'Password Reset',
        text: 'Password Reset',

        html: "Customer details without an email: <br><br>"
            + "Customer Username :" + contact
            + "<br>Clients Email :" + email
            + "<br><br>Regards"
        ,
        replyTo: ""
    }, (error) => {
        if (error) {
            res.json("failed");
        } else {
            //res.json(result)
            res.json("sent")
        }
    })
}

// send email to clients to reset password
let sendResetEmail = (email, newPassword) => {


    try {

        var transporter = nodemailer.createTransport({

            //service: "Outlook365",
            host: 'smtp.googlemail.com',                  // hostname
            //service: 'outlook', 
            port: 465,
            secure: true,
            //requireTLS: true,
            auth: {
                user: "statuscapitalit@gmail.com",
                pass: 'guxb tdld yzot kict'
                //user: 'mkhululi.motha@scbs.co.sz',
                //pass: 'Qus29753'
            }/*,
            tls:
            {
                "ciphers": 'SSLv3',
                rejectUnauthorized: false
            }*/
        })

        transporter.sendMail({

            from: {
                name: 'STATUS CAPITAL',
                address: 'statuscapitalit@gmail.com' //process.env.frommail
            },
            to: email,
            subject: 'Password Reset',
            text: 'Password Reset',

            html: "Dear Valued customer: <br><br>"
                + "Your new password is:" + newPassword
                + "<br>We recommend that you change it upone login"
                + "<br><br>Regards"
            ,
            replyTo: ""
        }, (error) => {
            if (error) {
                res.json("failed");
            } else {
                //update database for new password


                res.json("sent")
            }
        })

    } catch (error) {
        console.log(error)
    }

}

// pasword generator
let assingNewPassword = async (username, password) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customers set password = ? where username = ? limit 1"

            db.query(query, [password, username], (err, result) => {

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

// get charge from database that has zero charge
let zeroCharge = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let charge = 'Pay Charge'

            let query = "select * from transactions where trans_type = ? and chargies_applied = 0 limit 1"

            db.query(query, [charge], (err, result) => {
                //console.log(err)
                if (err) {
                    //console.log(err)
                    return reject(err)
                }

                return resolve(result)

            })
        })

    } catch (error) {
        //console.log(error.message)
    }

}

// update zero charge

let updateZeroCharge = async (tran_id, chargeName, amount) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update transactions set trans_type = ? , chargies_applied = ? where tran_id = ? limit 1"

            db.query(query, [chargeName, amount, tran_id], (err, result) => {

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

//
let getTempcode = async (cif) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from customerno where customerNo = ? limit 1"

            db.query(query, [cif], (err, result) => {

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

// saving inquire
let saveInquire = async (clientNo, clientName, title, inquire) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into inquire (clientNo ,clientName , title , inquire) select ?,?,?,? "

            db.query(query, [clientNo, clientName, title, inquire], (err, result) => {

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

// get client inquries
let getMyInquire = async (clientNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from inquire where clientNo = ?"

            db.query(query, [clientNo], (err, result) => {

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

//delete Enquire
let deleteEnquire = async (no) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "delete from inquire where No = ? limit 1"

            db.query(query, [no], (err, result) => {

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

//get all enquiries
let getAllEnquries = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from inquire"

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

//update enquire
let updateEnquire = async (no, status, hangler) => {

    console.log(no)

    try {

        return await new Promise((resolve, reject) => {

            let query = "update inquire set status = ? , hangler = ?  where No = ? limit 1"

            db.query(query, [status, hangler, no], (err, result) => {

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


module.exports = { updateEnquire, getAllEnquries, deleteEnquire, getMyInquire, saveInquire, getTempcode, zeroCharge, updateZeroCharge, updateEmailsent, assingNewPassword, sendResetEmail, alertIT, resetPassEmail, resetAttempts, loginAttempts, getLoginAttempts, savingsTrans, loanRepayment, makeDeposit, makeWithdrawal, oldMessages, saveReadMessages, messages, recordAccountStatement, loanDetails, getSavingsTransactions, transactions, savingsTranfers, clientAccounts, loanApplication, saveCustomers, getClientsCodes, registerAppUser, updateStatus, appUserLogin, getCustomerNo, changePaasword, transferMoney }

