const db = require('../../db/charge')

//save denoms
let saveDenoms = async (user, denoms) => {

    try {

        denoms.forEach(el => {

            let twoH = el.twoH
            let oneH = el.oneH
            let fifty = el.fifty
            let twenty = el.twenty
            let ten = el.ten
            let five = el.five
            let two = el.two
            let one = el.one
            let fiftycent = el.fiftycent
            let thwentycent = el.twentycent
            let tencent = el.tencent
            let date = el.date

            return new Promise((resolve, reject) => {

                let query = "update denominations "
                    + "set twoH = twoH + ? ,oneH = oneH + ? ,fifty = fifty + ?,twenty = twenty + ?,ten = ten + ? ,five = five + ?,two = two + ?,one = one + ?,fiftycent = fiftycent + ?,thwentycent = thwentycent + ?,tencent = tencent + ?"
                    + " where  user = ? and date = ? limit 1"

                db.query(query, [twoH, oneH, fifty, twenty, ten, five, two, one, fiftycent, thwentycent, tencent, user, date], (err, result) => {

                    if (err) {
                        return reject(err)
                    }
                    return resolve(result)
                })

            })

        });



    } catch (error) {
        console.log(error)
    }
}

//

//save denoms
let deductDenoms = async (user, denoms) => {

    try {

        denoms.forEach(el => {

            let twoH = el.twoH
            let oneH = el.oneH
            let fifty = el.fifty
            let twenty = el.twenty
            let ten = el.ten
            let five = el.five
            let two = el.two
            let one = el.one
            let fiftycent = el.fiftycent
            let thwentycent = el.twentycent
            let tencent = el.tencent
            let date = el.date

            return new Promise((resolve, reject) => {

                let query = "update denominations "
                    + "set twoH = twoH - ? ,oneH = oneH - ? ,fifty = fifty - ?,twenty = twenty - ?,ten = ten - ? ,five = five - ?,two = two - ?,one = one - ?,fiftycent = fiftycent - ?,thwentycent = thwentycent - ?,tencent = tencent - ?"
                    + " where  user = ? and date = ? limit 1"

                db.query(query, [twoH, oneH, fifty, twenty, ten, five, two, one, fiftycent, thwentycent, tencent, user, date], (err, result) => {

                    if (err) {
                        return reject(err)
                    }
                    return resolve(result)
                })

            })

        });



    } catch (error) {
        console.log(error)
    }
}



//save user for a denoms when logged

let inserTellerDenoms = async (user, date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into denominations (user , date) select ? , ? where not exists ( select user , date  from denominations"
                + " where user = ? and date = ? )"

            db.query(query, [user, date, user, date], (err, result) => {

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

// save a new denoms for a teller
let adminDenoms = async (denoms) => {

    try {

        return await new Promise((resolve, reject) => {
            
            denoms.forEach(el => {
                
                let twoH = el.twoH
                let oneH = el.oneH
                let fifty = el.fifty
                let twenty = el.twenty
                let ten = el.ten
                let five = el.five
                let two = el.two
                let one = el.one
                let fiftycent = el.fiftycent
                let thwentycent = el.twentycent
                let tencent = el.tencent
                let date = el.date
                let username = el.username
                let allocatedAmount = el.allocatedAmount
                
                
                let query = "insert into denominations (user ,twoH,oneH,fifty,twenty,ten,five,two,one,fiftycent,thwentycent,tencent , allocatedAmount , date) select ?,?,?,?,?,?,?,?,?,?,?,?,?,?"
                    + " where not exists ( select user , date from denominations where user = ? and date = ?)"

                db.query(query, [username, twoH, oneH, fifty, twenty, ten, five, two, one, fiftycent, thwentycent, tencent, allocatedAmount, date, username, date], (err, result) => {

                    if (err) {
                        return reject(err)
                    }
                    return resolve(result)
                })



            });

        })

    } catch (error) {
        console.log(error)
    }

}

//get number of denominations from the database
let getDenominations = async (username, date) => {


    try {

        return await new Promise((resolve, reject) => {

            let query = " select * from denominations where user = ? and date = ?"

            db.query(query, [username, date], (err, result) => {

                if (err) {
                    return reject(err)
                }
                console.log(resolve(result))

                return resolve(result)

            })

        })

    } catch (error) {
        console.log(error)
    }

}


// get all denoms for the day

let getAllTellersDenomns = async (date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from denominations where date = ?"

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

// sum transactions for a person for a day
let sumTodayBalances = async (date) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "SELECT teller , sum(amount) as amount , type  FROM withdrawaldeposittransactions where date = ?  group by type "
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



module.exports = { getAllTellersDenomns, saveDenoms, inserTellerDenoms, adminDenoms, deductDenoms, getDenominations, sumTodayBalances }