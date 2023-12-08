const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
const app = require("../modal/app")
const client = require("../modal/clients")
const generator = require('generate-password');
const mutler = require("multer");
dotenv.config();


var filename;

var storage = mutler.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './attachments/')
    }, filename: function (req, file, cb) {
        cb(null, file.originalname);
        filename = file.originalname
    }
})

var upload = mutler({ storage: storage })

router.post('/requestsavingstatement', (req, res) => {

    try {

        let email = req.body.email;
        let name = req.body.name
        let accountNo = req.body.account

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
                address: 'loansupport@scbs.co.sz' //process.env.frommail
            },
            to: ['mkhululi.motha@scbs.co.sz , Nombulelo.Simelane@scbs.co.sz , Lomave.Dlamini@scbs.co.sz'],
            subject: 'Request of my savings account statement',
            text: 'Statement',

            html: "Kindly provide statement for the below customer.<br><br>"
                + " " + name + " <br>"
                + "Savings Account " + accountNo + "<br>"
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


//send email to scbs for a loan statement

router.post('/send', async (req, res) => {

    //send email esxpect name client identification code

    try {

        let email = req.body.clientEmail;
        let name = req.body.clientName
        let accountNo = req.body.accountNo

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

            from: "statuscapitalit@gmail.com",
            to: ['mkhululi.motha@scbs.co.sz , nomfanelo.ziyane@scbs.co.sz, bongiwe.gina@scbs.co.sz '],
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

            console.log(error)

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

                    if (dt.data["emailAddress"] !== undefined) {

                        // send email to clients with new password

                        //let emailsss = 'boymotsa@gmail.com'

                        app.sendResetEmail(dt.data["emailAddress"], password)

                        //app.sendResetEmail(emailsss, password)

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

//customer app email 
router.post('/appinfo', (req, res) => {


    setInterval(() => {

        // will use time up

        /*let name = mail["name"]*/
        let email
        let tempcode

        subject = "SCBS Mobile Application"

        // function to get codes
        app.getClientsCodes().then(data => {

            let myData = data;

            myData.forEach((dt) => {

                email = dt["contact"]
                tempcode = dt["temporaryCode"]

            })
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
                //from: 'mkhululi.motha@scbs.co.sz',

                from: {
                    name: 'STATUS CAPITAL',
                    address: 'it@scbs.co.sz'
                },

                to: email,  //,[],
                bcc: [],
                subject: subject,
                text: 'STATUS CAPITAL',


                attachments: [
                    {
                        filename: "footer.png",
                        path: "./attachments/footer.png",
                        cid: "footer"
                    }

                ],
                html: '<h4>Dear Valued Member<br><br>'

                    + 'You can now download the Status mobile APP by clicking on the link below:<br><br>'

                    + 'Link: https://scbs.co.sz/#/mobileapp <br><br>'

                    + 'Temporary Code: ' + tempcode + '<br><br> The above code will be used when registering on the mobile app.  <br><br>'

                    + 'For any further assistance, please send a WhatsApp message to +268 7944 6339<br><br>'

                    + 'Regards<br></h4><br><br>'
                    + '<img src="cid:footer" style="width:50%"/>',
                replyTo: "info@scbs.co.sz"

            }, (error, result) => {
                if (error) {
                    //res.json(error);
                    console.log(error)
                } else {
                    //res.json(result)

                    //update function when email has been sent
                    app.updateEmailsent(tempcode)
                    console.log(result)
                }
            })

        }).catch((err) => {
            res.sendStatus(err)
        })



    }, 12000);


})

// send emails to clients to make downloads
router.post('/savelientsemails', (req, res) => {

    // save client emails

    let data = req.body.data

    try {

        data.forEach((dt) => {

            client.saveClientEmails(dt["email"], dt["name"]).then(response => {

                console.log(response)

            })
        })

    } catch (error) {
        console.log("error")
    }
})


// send email to clients
router.post('/sendpromoemails', (req, res) => {

    setInterval(() => {

        // will use time up

        /*let name = mail["name"]*/
        let email
        let name

        subject = "INGCAMU LOAN"

        // function to get codes
        client.getClientEmail().then(data => {

            let myData = data;

            myData.forEach((dt) => {

                email = dt["email"]
                name = dt["name"]

            })

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
                //from: 'mkhululi.motha@scbs.co.sz',

                from: {
                    name: 'STATUS CAPITAL',
                    address: 'it@scbs.co.sz'
                },

                to: email,  //,[],
                bcc: [],
                subject: subject,
                text: 'STATUS CAPITAL',


                attachments: [
                    {
                        filename: "footer.png",
                        path: "./attachments/footer.png",
                        cid: "footer"
                    }

                ],
                html: 'Dear <b>' + name + '</b> <br><br>'

                    + 'Thank you for choosing to grow with us.<br><br>'

                    + 'Kindly be notified, your fixed deposit qualifies you to our Ingcamu loan of up to 80% of your investment.<br><br>'

                    + 'Kindly contact our branch for more information.<br><br>Regards<br>'

                    + '<b>SCBS MANAGEMENT</b><br><br><br>'
                    + '<img src="cid:footer" style="width:50%"/>',
                replyTo: "info@scbs.co.sz"

            }, (error, result) => {
                if (error) {
                    //res.json(error);
                    console.log(error)
                } else {
                    //res.json(result)

                    //update function when email has been sent
                    client.updateSentEmail(email)
                    console.log(result)
                }
            })

        }).catch((err) => {
            res.sendStatus(err)
        })



    }, 12000);

})


module.exports = router