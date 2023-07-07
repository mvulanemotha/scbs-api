const express = require('express')
const app = express();
const morgan = require('morgan');
const cors = require('cors')
const chargies = require('./api/routes/charge')
const jobs = require('./api/routes/jobs')
const charge = require('./api/routes/charge')
const clients = require('./api/routes/clients')
const products = require('./api/routes/products')
const withholdingtax = require('./api/routes/withholdingtax')
const transactions = require('./api/routes/transactions')
const login = require('./api/routes/login')
const teller = require('./api/routes/teller')
const auth = require('./api/routes/auth')
const sms = require('./api/routes/sms')
const denomns = require('./api/routes/denoms')
const fixedproducts = require('./api/routes/fixedproducts')
const clientapp = require('./api/routes/app')
const email = require('./api/routes/email')

var bodyParser = require('body-parser')



app.use(bodyParser.json({ limit: '70mb' }))
app.use(bodyParser.urlencoded({ limit: '70mb', extended: false }))

app.use(morgan('dev'))

app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Headers', '*');


    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
})

app.use(cors())

app.use(express.json())

app.use('/scbsserver/chargies', chargies)
app.use('/scbsserver/jobs', jobs)
app.use('/scbsserver/ ', charge)
app.use('/scbsserver/clients', clients)
app.use('/scbsserver/products', products)
app.use('/scbsserver/withholdingtax', withholdingtax)
app.use('/scbsserver/transactions', transactions)
app.use('/scbsserver/login', login)
app.use('/scbsserver/teller', teller)
app.use('/scbsserver/auth', auth)
app.use('/scbsserver/sms', sms)
app.use('/scbsserver/denoms', denomns)
app.use('/scbsserver/fixedproducts', fixedproducts)
app.use('/scbsserver/clientapp', clientapp)
app.use('/scbsserver/email', email)
app.use('/scbsserver/charge', chargies)


// handling errors if none of the routes were accessed
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app