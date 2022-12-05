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

            
            let query = "select * from clientsnumbers where status = 0 limit 10"

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


            let query = "update clientsnumbers set status = 1 where contact = ? limit 1"

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


module.exports = { getClient , saveClient, getClientLocal, updateSentsms }