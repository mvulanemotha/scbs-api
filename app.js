const express = require('express')
const app = express();
const morgan = require('morgan');
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
    res.header('Access-Control-Allow-Methods', 'POST', 'GET', 'PUT', 'DELETE');
    //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Headers', '*');
    //res.header('Access-Control-Allow-Headers', ' Content-Type');


    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
})

app.use(express.json())

app.use('/chargies', chargies)
app.use('/jobs', jobs)
app.use('/ ', charge)
app.use('/clients', clients)
app.use('/products', products)
app.use('/withholdingtax', withholdingtax)
app.use('/transactions', transactions)
app.use('/login', login)
app.use('/teller', teller)
app.use('/auth', auth)
app.use('/sms', sms)
app.use('/denoms', denomns)
app.use('/fixedproducts', fixedproducts)
app.use('/clientapp' , clientapp)
app.use('/email', email)
app.use('/charge', chargies)



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