const db = require('../../db/index')
const db2 = require('../../db/charge');
const dotenv = require('dotenv');
dotenv.config();
const { default: axios } = require('axios');
const headers = require('../modal/header');



// save a charge type to database

let chargeType = (code, type, description) => {

    try {

        return new Promise((resolve, reject) => {

            // upgrade query not to insert into the database
            let query = "insert into chargename(Code , type , Description) select ?, ? , ? where not exists (select Code from chargename where Code = ?)"

            db2.query(query, [code, type, description, code], (err, result) => {

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


// save a fixed charge
let saveFixed = (code, amount) => {

    try {

        return new Promise((resolve, reject) => {

            //let query = "insert into fixedcharge(Code , Amount) select ?,?";
            let query = "insert into fixedcharge(Code , Amount) select ?,? where not exists (select Code from fixedcharge where Code = ?)"

            db2.query(query, [code, amount, code], (err, result) => {

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


// get all chargies
let getChargies = () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from chargename order by Code asc "

            db2.query(query, [], (err, result) => {

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

// save a range of charge
let saveRange = (code, percent, minAmount, maxAmount, addedAmount, primeValue, VAT, arrearsMonth) => {

    //////code percent minAmount maxAmount addedAmount primeValue VAT

    try {

        return new Promise((resolve, reject) => {

            /* let query = "insert into chargerange (code, percent, minAmount, maxAmount, addedAmount, primeValue, VAT , arrearsMonth)"
             + "select ?,?,?,?,?,?,?,?"*/

            let query = "insert into chargerange (code, percent, minAmount, maxAmount, addedAmount, primeValue, VAT , month)"
                + "select ?,?,?,?,?,?,?,? WHERE NOT EXISTS ( select Code from chargerange where Code = ? )"

            db2.query(query, [code, percent, minAmount, maxAmount, addedAmount, primeValue, VAT, arrearsMonth, code], (err, result) => {

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

// get charge range
let getChargeRange = () => {

    return new Promise((resolve, reject) => {

        let query = "select * from chargerange"

        db2.query(query, [], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })

    })

}

// delete a charge
let deleteCharge = (code) => {

    return new Promise((resolve, reject) => {

        let query = "delete from chargename where Code = ?"

        db2.query(query, [code], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })
    })

}

////////////////////end of file for charge.js from another file

// function to list clients
let savingsaccounts = (res) => {

    try {


        let apiKey = process.env.key;
        let username = process.env.User
        let password = process.env.password



        let musonCredentials = username + ':' + password

        let buff = new Buffer.from(musonCredentials)

        let base64Credentials = buff.toString('base64');

        let authHeader = 'Basic ' + base64Credentials

        //let token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')

        let header = {
            //'Authorization': 'Basic U0NCUzAwMTA6TXZ1bGFuZTJAQA==',//`Basic ${token}`,
            //'User-Agent': 'PostmanRuntime/7.29.2',
            'Authorization': authHeader,
            'X-Fineract-Platform-TenantId': 'StatusCapital',
            'x-api-key': apiKey, //'G1ApOPzYok3CnSupBeBMfRMXEFxHVMT5DaFc5854',
            'Content-Type': 'application/json',
            //'Accept-Encoding' : 'gzip, deflate, br'
        }


        //console.log(authHeader)
        //var basicAuth = authHeader

        //var reqData = "username=ganesh&password=123456&grant_type=password";
        axios({
            method: 'get',
            url: process.env.url + 'jobs',
            withCredentials: true,
            crossdomain: true,
            //data: $.param(reqData),    
            headers: header

        }).then(function (response) {

            res.json(response.data)
            //console.log(response)


        })
            .catch(function (error) {

                console.log(error)

            });


    } catch (error) {
        console.log(error);
    }
}

// upload charge muson
// get charge name from database to muson

let getChargeUploadMuson = () => {

    try {
        //  No Code type Description status 

        //AA Savings Early Redemption Of FDR  
        return new Promise((resolve, reject) => {

            let query = "select Code, type, Description from chargename where status = 0 limit 1"

            db.query(query, [], (err, result) => {

                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })

        })

    } catch (error) {
        console.log(error)
    }

}


// save charge to musoni
let saveChargeMusoni = (code, type, desc, res) => {

    type = type.charAt(0).toUpperCase() + type.slice(1);

    var appliesTo = 0;

    var charge = "empty"

    if (type === 'Savings') {
        appliesTo = 2

        charge = {
            "name": code + '  ' + desc,
            "chargeAppliesTo": appliesTo,
            "currencyCode": "SZL",
            "locale": "en",
            "amount": "100",
            "chargeTimeType": "2",
            "chargeCalculationType": "1",
            "active": true
        }

    } else if (type === 'Loan') {
        appliesTo = 1

        charge = {
            "name": code + '  ' + desc,
            "chargeAppliesTo": appliesTo,
            "currencyCode": "SZL",
            "locale": "en",
            "amount": "100",
            "chargeTimeType": "2",
            "chargeCalculationType": "1",
            "chargePaymentMode": "0",
            "active": true
        }
    } else {

        return;

    }


    axios({
        method: 'post',
        url: process.env.url + 'charges',
        withCredentials: true,
        crossdomain: true,
        data: charge,
        headers: headers.headers()

    }).then(function (response) {

        res.json(response.data)

    })
        .catch(function (error) {
            res.json(error)
        })

}

// update database when saved
let updateSavedInMuson = (code) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "update chargename set status = 1 where Code = ?"

            db.query(query, [code], (err, result) => {

                if (err) {
                    return reject(err)
                }
                return resolve(result)
            })

        })

    } catch (error) {
        console.log(error);
    }

}

// get savings accounts
let listsavingsAccounts = async () => {

    try {

        return await axios({
            method: "get",
            url: process.env.url + "savingsaccounts/",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }

}



//GET ALL TRANSACTIONAL ID

let transactions = async (AccountNo, transactionalID) => {

    try {

        // use axios to get that
        return await axios({
            method: "get",
            url: process.env.url + 'savingsaccounts/' + AccountNo + '/transactions/' + transactionalID,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })


    } catch (error) {
        console.log(error)
    }

}

//loan transaction

let loanTransactions = async (AccountNo, transactionalID) => {

    try {

        // use axios to get that
        return await axios({
            method: "get",
            url: process.env.url + 'loans/' + AccountNo + '/transactions/' + transactionalID,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        })


    } catch (error) {
        // console.log(error)
    }

}


//save savings accounts in database
let saveSaving = (clientID, accountNo, accountId, clientName) => {

    try {


        return new Promise((resolve, reject) => {

            let query = "insert into chargesavings(ClientID , clientName , accountID , accountNo) select ?,?,?,? where not exists ( select ClientID , accountID from chargesavings where ClientID = ? and accountNo = ? )"

            db.query(query, [clientID, clientName, accountId, accountNo, clientID, accountNo], (err, result) => {

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



// get savings clients savings accounts
let getSavingsAccounts = () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select accountNo , clientName from chargesavings where checked = ? limit 1"

            db.query(query, [false], (err, result) => {
                if (err) {
                    return reject(err)
                }

                return resolve(result)
            })


        })

    } catch (error) {
        console.log(error);
    }

}


// save clients transactions
let saveClientsTransactions = (transID, accountNo, amount, transDate) => {

    try {
        //No TsansactionalID Amount transDate status 

        return new Promise((resolve, reject) => {

            let query = "insert into transactionals (tsansactionalID,accountNo, amount, transDate) select ?,?,?,? where not exists ( select tsansactionalID from transactionals where tsansactionalID = ? )"
            db.query(query, [transID, accountNo, amount, transDate, transID], (err, result) => {

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


// get data to pay the charge 
let getTransToPayCharge = () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select tsansactionalID , accountNo , amount from transactionals where status = 0 limit 1"

            db.query(query, [], async (err, result) => {

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


// create charge b4 we pay it

let createClientCharge = async (clientAccount, amount, chargeId = 306, date) => {

    try {

        var data = {
            "chargeId": chargeId,
            "locale": "en",
            "amount": amount,
            "dateFormat": "dd MMMM yyyy",
            "dueDate": date
        }

        return await axios({
            method: "post",
            url: process.env.url + 'savingsaccounts/' + clientAccount + '/charges',
            withCredentials: true,
            crossdomain: true,
            data: data,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }
}



// mot yet proceesed
// pay chargies
let payCharge = async (accountNo, chargeid, amount, date) => {

    //list all the 

    let data = {

        "dateFormat": "dd MMMM yyyy",
        "locale": "en",
        "amount": amount,
        "dueDate": "" + date + ""
    }


    try {

        return await axios({

            method: "post",
            //url: process.env.url + 'savingsaccounts/'+ accountNo +'/transactions/'+chargeid,
            url: process.env.url + 'savingsaccounts/' + accountNo + '/charges/' + chargeid + '?command=paycharge',
            withCredentials: true,
            crossdomain: true,
            data: data,
            headers: headers.headers()

        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {
        console.log(error)
    }

}


// get charge id for for a savings account
let getChargeDetails = async (accountNo) => {


    try {

        return await axios({

            method: "get",
            url: process.env.url + "savingsaccounts/" + accountNo + "/charges/",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()

        })

    } catch (error) {
        console.log(error)
    }

}

// save chargies to the database
let saveChargePaymentDetails = (id, chargeid, accountId, amount) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into chargedetails(id ,chargeId ,accountId ,amount) select ?,?,?,?"
            db.query(query, [id, chargeid, accountId, amount], (err, result) => {
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

// getcharge datails to pay for a charge
let getChargeToPay = () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select id , accountId , amount from chargedetails"
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


// flag false when data has been checked for transactions
let updateWhenChecked = (accountNo) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "update chargesavings set checked = ? where accountNo = ? limit 1"

            db.query(query, [true, accountNo], (err, result) => {

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

// save loan charge in muson
let saveLoanClientCharge = async (accountNo, chargeid, amount, date) => {

    try {



        // improve by having charge array to be used to post the charge

        let data = {

            "chargeId": chargeid,
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
            data: data,
            headers: headers.headers()

        }).catch((err) => {
            console.log(err)
        })

    } catch (error) {
        console.log(error)
    }

}

// make charge payments in musoni

let payMusoniLoanChargies = async (accountNo, chargeId, date) => {

    try {

        let data = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en",
            "transactionDate": date
        }


        return await axios({

            method: "post",
            url: process.env.url + "loans/" + accountNo + "/charges/" + chargeId + "?command=pay",
            withCredentials: true,
            crossdomain: true,
            data: data,
            headers: headers.headers()
        })

    } catch (error) {
        console.log(error)
    }
}



// save charge details to the database 
let saveClientLoancharge = async (accountNo, chargeid, amount) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into loanchargiespayments(accountNo, chargeId, amount) select ?,?,?";

            db.query(query, [accountNo, chargeid, amount], (err, result) => {

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

// get loan charge details for payments
let getLoanDetailsPayments = async () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from loanchargiespayments where status = 0"

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


// delete charge details
let deleteChargeDetails = async (code) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "delete from chargerange where Code = ? limit 1"

            db.query(query, [code], (err, result) => {

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

// instert mpp account into database
let storeMppAccount = async (accountNo, date, amount, rate) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into mpp (accountNo , date , amount , rate ) select ?,?,?,? from dual where not exists (select accountNo from mpp where accountNo = ?)"

            db.query(query, [accountNo, date, amount, rate, accountNo], (err, result) => {

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

// get mpp from database

let getmppAccount = async () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from mpp"

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

// run mpp charge 

let getUnRunmpp = async (date) => {

    try {

        // run mpp charge in musoni

        return new Promise((resolve, reject) => {

            let query = "select * from mpp where accountNo not in (select accountNo from runmpp where Month(date) = Month(?))"

            db.query(query, [date], (err, result) => {

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

//insert data into runmpp
let storeRanmpp = async (accountNo, date) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into runmpp (accountNo , date) select ?,? from dual where not exists ( select accountNo from runmpp where Month(date) = Month(?) and accountNo = ? )"

            db.query(query, [accountNo, date, date, accountNo], (err, result) => {

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

// save monthly admin feee
let monthlyLoanFee = async (accountNo, date) => {

    try {

        return new Promise((resolve, reject) => {

            let query = "insert into loanadminfee (accountNo , date) select ? ,? from dual where not exists ( select accountNo from loanadminfee where accountNo = ? )"

            db.query(query, [accountNo, date, accountNo], (err, result) => {

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

// run monthly loan admin fee
let saveMonthlyAdminFeeLoanAccount = (accountNo, date) => {


    try {

        return new Promise((resolve, reject) => {

            let query = "insert into loanAdminProcess (accountNo , date) select ?,? from dual where not exists ( select accountNo from loanAdminProcess where Month(date) = Month(?) and accountNo = ? )"

            db.query(query, [accountNo, date, date, accountNo], (err, result) => {

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


// get admin accounts from database


let getMonthlyLoanAccounts = async () => {

    try {

        return new Promise((resolve, reject) => {

            let query = "select * from loanadminfee order by accountNo asc"

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

//
let getUnRunMonthlyAdmin = async (date) => {

    try {

        // run mpp charge in musoni

        return new Promise((resolve, reject) => {

            let query = "select * from loanadminfee where accountNo not in (select accountNo from loanadminprocess where Month(date) = Month(?))"

            db.query(query, [date], (err, result) => {

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


//store accounts to culculate charge

let storeMulaAccounts = async (accountNo, interest, date) => {

    try {
        
        return await new Promise((resolve, reject) => {

            let query = "insert into savingsmulaacccharge(accountNo, interest , date) select ?,?,?"//where not exists ( select accountNo from savingsmulaacccharge where accountNo = ? )"  //improve later
            
            db2.query(query, [accountNo, interest, date], (err, result) => {

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

//select where no withholding tax was applied
let getWithholdingTax = async () => {

    return await new Promise((resolve, reject) => {

        let query = "select * from savingsmulaacccharge where withholdingtax = 0 limit 1"

        db2.query(query, [], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })

    })
}

//select where no withholding tax was applied
let getadminfee = async () => {

    return await new Promise((resolve, reject) => {

        let query = "select * from savingsmulaacccharge where adminfee = 0 limit 1"

        db2.query(query, [], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })

    })
}

//select where no withholding tax was applied
let geteft = async () => {

    return await new Promise((resolve, reject) => {

        let query = "select * from savingsmulaacccharge where eft = 0 limit 1"

        db2.query(query, [], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })

    })
}

//get sms
let getsms = async () => {

    return await new Promise((resolve, reject) => {

        let query = "select * from savingsmulaacccharge where sms = 0 limit 1"

        db2.query(query, [], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })

    })
}

//update when run
//select where no withholding tax was applied
let updatesms = async (accountNo) => {

    return await new Promise((resolve, reject) => {

        let query = "update savingsmulaacccharge set sms = 1 where sms = 0 and accountNo = ? limit 1"

        db2.query(query, [accountNo], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })

    })
}




//update when run
//select where no withholding tax was applied
let updategetWithholdingTax = async (accountNo) => {

    return await new Promise((resolve, reject) => {

        let query = "update savingsmulaacccharge set withholdingtax = 1 where withholdingtax = 0 and accountNo = ? limit 1"

        db2.query(query, [accountNo], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })

    })
}

//select where no withholding tax was applied
let updategetadminfee = async (accountNo) => {

    return await new Promise((resolve, reject) => {

        let query = "update savingsmulaacccharge set adminfee = 1 where adminfee = 0 and accountNo = ? limit 1"

        db2.query(query, [accountNo], (err, result) => {

            if (err) {
                return reject(err)
            }

            return resolve(result)

        })

    })
}

//select where no withholding tax was applied
let updategeteft = async (accountNo) => {

    return await new Promise((resolve, reject) => {

        let query = "update savingsmulaacccharge set eft = 1 where eft = 0 and accountNo = ? limit 1"

        db2.query(query, [accountNo], (err, result) => {

            if (err) {
                return reject(err)
            }
            return resolve(result)
        })

    })
}


//save mula balances
let saveMulaBalances = async (accountNo, customerNo, balance, date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into customerbalances (accountNo, customerNo,balance , date) select ?,?,?,? where not exists (select accountNo , date from customerbalances where accountNo = ? and date = ? ) "

            db2.query(query, [accountNo, customerNo, balance, date, accountNo, date], (err, result) => {

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

//get balances
let getmulaBalances = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from customerbalances where status = 0 limit 1"

            db2.query(query, [], (err, result) => {

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

let updateSent = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customerbalances set status = 1 where accountNo = ? limit 1"

            db2.query(query, [accountNo], (err, result) => {
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

// check if account has requested statement
let checkStatement = async (accountNo) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = 'select accountNo from loanstatementcharge where accountNo = ?'

            db2.query(query, [accountNo], (err, result) => {

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


module.exports = {
    getsms, updatesms, checkStatement, saveMulaBalances, getmulaBalances, updateSent,
    updategetWithholdingTax, updategetadminfee, updategeteft, getWithholdingTax, geteft, getadminfee,
    storeMulaAccounts, getMonthlyLoanAccounts, getUnRunMonthlyAdmin, storeRanmpp, monthlyLoanFee,
    saveMonthlyAdminFeeLoanAccount, storeMppAccount, getmppAccount, getUnRunmpp,
    savingsaccounts, getChargeUploadMuson, saveChargeMusoni,
    updateSavedInMuson, listsavingsAccounts, transactions,
    saveSaving, getSavingsAccounts, saveClientsTransactions,
    getTransToPayCharge, createClientCharge, getChargeDetails,
    saveChargePaymentDetails, payCharge, getChargeToPay, updateWhenChecked,
    chargeType, getChargies, saveFixed, saveRange, getChargeRange, deleteCharge,
    saveLoanClientCharge, saveClientLoancharge, getLoanDetailsPayments,
    payMusoniLoanChargies, deleteChargeDetails, loanTransactions
}