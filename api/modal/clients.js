const headers = require("../modal/header")
const db = require("../../db/clients")
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();


// get clients from musoni
let clients = async () => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "clients",
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()

        })

    } catch (error) {
        console.log(error)
    }

}


// get a specific client
let getClient = async (clientID) => {

    try {

        return await axios({

            method: "get",
            url: process.env.url + "clients/" + clientID,
            withCredentials: true,
            crossdomain: true,
            headers: headers.headers()

        })

    } catch (error) {
        console.log(error)
    }

}

//save clients in database
let saveClient = async (contact) => {

    
    try {

        return await new Promise((resolve, reject) => {


            let query = "insert into clientsnumbers(contact) select ? where not exists (select contact from clientsnumbers where contact = ?)"

            db.query(query, [contact, contact], (err, result) => {

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

// get client 

let getClientLocal = async () => {


    try {

        return await new Promise((resolve, reject) => {


            let query = "select * from clientsnumbers where status = 0 limit 1"

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


// update sent sms
let updateSentsms = async (contact) => {

    
    try {

        return await new Promise((resolve, reject) => {


            let query = "update clientsnumbers set status = 1 where contact = ? and status = 0 limit 1"

            db.query(query, [contact], (err, result) => {

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

//save clients emails
let saveClientEmails = async (email, name) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "insert into customeremails (email, name) select ?,?"

            db.query(query, [email, name], (err, result) => {

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

// update sent email to clients
let updateSentEmail = async (email) => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "update customeremails set status = 1 where email = ? limit 1"

            db.query(query, [email], (err, result) => {

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

// get client email 
let getClientEmail = async () => {

    try {

        return await new Promise((resolve, reject) => {

            let query = "select * from customeremails where status = 0 limit 1"

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


module.exports = {getClientEmail, updateSentEmail, saveClientEmails, getClient, saveClient, getClientLocal, updateSentsms }