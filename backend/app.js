const express = require('express')
const app = express();

const cors = require('cors');
app.use(cors({origin: '*'}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import all routes
// Auth route
const auth = require('./routes/auth');
// Customers route
const customer = require('./routes/customer');
// Products route
const products = require('./routes/product');
// suppliers route
const suppliers = require('./routes/supplier');
// cashbox route
const cashbox = require('./routes/cashbox');
// sale route
const sale = require('./routes/sale');
// buy route
const buy = require('./routes/buy');
// buy route
const subsidiary = require('./routes/subsidiary');
// buy payment route
const buyPayment = require('./routes/paymentBuy');
// buy payment route
const salePayment = require('./routes/paymentSale');

app.use('/api/v1', auth);
app.use('/api/v1', customer);
app.use('/api/v1', products);
app.use('/api/v1', suppliers);
app.use('/api/v1', cashbox);
app.use('/api/v1', sale);
app.use('/api/v1', buy);
app.use('/api/v1', subsidiary);
app.use('/api/v1', buyPayment);
app.use('/api/v1', salePayment);

module.exports = app;