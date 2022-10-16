const Supplier = require('../models/supplierModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all suppliers   =>   /api/v1/suppliers
exports.getSuppliers = catchAsyncErrors(async (req, res, next) => {

    const { results } = await Supplier.getSuppliers();

    res.status(200).json({
        success: true,
        results
    });

}); // END getSuppliers

// Get all customers   =>   /api/v1/customer/new
exports.createSupplier = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.name) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Supplier.createSupplier(req.body);

    if (!resCreate.success) {
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    req.body.id_supplier = resCreate.results.insertId;

    res.status(200).json({
        success: true,
        message: `Proveedor creado con éxito`,
        newId: resCreate.results.insertId,
        supplier: req.body
    });

}); // END createSupplier