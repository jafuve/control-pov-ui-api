const Customer = require('../models/customerModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all customers   =>   /api/v1/customers
exports.getCustomers = catchAsyncErrors(async (req, res, next) => {

    const { results } = await Customer.getCustomers();

    res.status(200).json({
        success: true,
        results
    });

}); // END getCustomers

// Get all customers   =>   /api/v1/customer/new
exports.createCustomer = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.name) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Customer.createCustomer(req.body);
    if (!resCreate.success) {
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    req.body.id_customer = resCreate.results.insertId;

    res.status(200).json({
        success: true,
        message: `Cliente creado con éxito`,
        newId: resCreate.results.insertId,
        customer: req.body
    });

}); // END getCustomers