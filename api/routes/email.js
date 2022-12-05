const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
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

        let contact = req.body.contact;
        let nationalID = req.body.nationalID

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
                address: 'it@scbs.co.sz' //process.env.frommail
            },
            to: ['mkhululi.motha@scbs.co.sz'],
            subject: 'Password Reset',
            text: 'Password Reset',

            html: "Customer information: <br><br>"
                + "Contact Number :" + contact
                + "<br>National ID :" + nationalID
                + "<br><br>Regards"

            ,
            replyTo: ""
        }, (error, result) => {
            if (error) {
                res.json("failed");
            } else {
                //res.json(result)
                res.json("sent")
            }
        })
    } catch (err) {
        console.log(err);
    }



})



module.exports = router