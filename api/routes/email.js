const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
const app = require("../modal/app")
const client = require("../modal/clients")
const generator = require('generate-password');
dotenv.config();


//send email to scbs for a loan statement

router.post('/send', async (req, res) => {

    //send email esxpect name client identification code

    try {

        let email = req.body.clientEmail;
        let name = req.body.clientName
        let accountNo = req.body.accountNo

        var transporter = nodemailer.createTransport({

            service: "Outlook365",
            host: 'smtp-mail.outlook.com',                  // hostname
            //service: 'outlook', 
            port: 587,
            secure: true,
            requireTLS: true,
            auth: {
                user: process.env.usermail,
                pass: process.env.passmail
            },
            tls:
            {
                "ciphers": 'SSLv3',
                rejectUnauthorized: false
            }
        })


        transporter.sendMail({

            from: {
                name: 'Customer App',
                address: 'loansupport@scbs.co.sz' //process.env.frommail
            },
            to: ['mkhululi.motha@scbs.co.sz'],
            subject: 'Request of statement',
            text: 'Loan Statement',

            html: "Kindly provide statement for the below customer.<br><br>"
                + " " + name + " <br>"
                + "Loan Account " + accountNo + "<br>"
                + "Customer Email " + email + "<br><br>"
                + "Regards"

            ,
            replyTo: ""
        }, (error, result) => {

            console.log(result)

            if (error) {
                //res.json(error);
                res.json("failed")
            } else {
                //res.json(result)
                res.json("sent")
            }
        })
    } catch (err) {
        console.log(err);
    }
})


// forgot client password
router.post('/forgotpass', (req, res) => {

    try {

        var password = generator.generate({
            length: 10,
            numbers: true
        });

        let username = req.body.contact
        let emailM = req.body.email

        app.getLoginAttempts(username).then(email => {

            let user = null

            if (email.length !== 0) {

                email.forEach(el => {
                    user = el["customerNo"]
                })

                // get email of user from core banking
                client.getClient(user).then(dt => {

                    console.log(dt.data["emailAddress"])

                    if (dt.data["emailAddress"] !== undefined) {
                        
                        // send email to clients with new password
                        app.sendResetEmail(dt.data["emailAddress"], password)


                        // update database on changed password
                        app.assingNewPassword(username, password)

                        res.json({ "message": "success" })


                    } else {
                        //alert IT if the user has no email
                        app.alertIT(username, emailM)

                        res.json({ "message": "Will be contacted by SCBS" })
                    }
                })


            }
        })

    } catch (err) {
        console.log(err);
    }
})



module.exports = router