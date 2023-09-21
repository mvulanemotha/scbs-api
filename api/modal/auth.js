const dotenv = require('dotenv');
const { default: axios } = require('axios');
const headers = require('../modal/header');
const db = require('../../db/charge')
const jwt = require('jsonwebtoken')


dotenv.config();


// auth on musoni

let authUser = async (username, password) => {

    try {

        return await axios({

            method: "post",
            url: process.env.url + "authentication?username=" + username + "&password=" + password,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()
        
        })

    } catch (error) {
        console.log(error)
    }

}

// update for an inactive user
let updateInActive = async (username) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update activeusers set Active = 0 where User = ? limit 1"

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

// update when a user is active
let updateActiveUser = async (username) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update activeusers set Active = 1 where User = ? limit 1"

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



// insert a new user to the system if they dont exists
let addNewUser = async (user) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into activeusers(User) select ? where not exists (select User from activeusers where User =?)"

            db.query(query, [user], (err, result) => {

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

// check if a user is still active
let checkActiveUser = async (User) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select Active from activeusers where User = ? limit 1"

            db.query(query, [User], (err, result) => {

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


//creating a jwt tokens and verifying them 

let ensureToken = async (req, res, next) => {

    try {



        const bearHeader = req.headers['authorisation']


        if (typeof bearHeader !== 'undefined') {

            const bearer = bearHeader.split(" ");
            const bearerToken = bearer["1"];
            req.token = bearerToken

            // verify the token
            await jwt.verify(req.token, process.env.jwt_token_key, (err, data) => {

                if (err) {
                    console.log(err)
                    //res.sendStatus(403)
                } else {
                    next()
                }
            })
            //next();
        } else {
            res.sendStatus(403)
        }


    } catch (error) {
        console.log(error)
    }


}




module.exports = { ensureToken, authUser, updateInActive, addNewUser, checkActiveUser, updateActiveUser }