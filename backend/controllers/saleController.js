const Sale = require('../models/saleModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all customers   =>   /api/v1/customers
exports.getSaleRecords = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.from || !req.body.to){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const { success, results, message } = await Sale.getProductSaleRecords(req.body.from, req.body.to, req.query.type);
    // console.log(success)
    if(!success){
        return res.status(200).json({
            success: false,
            message
        });
    }

    res.status(200).json({
        success: true,
        results
    });

}); // END getCustomers

// Get all customers   =>   /api/v1/customer/new
exports.createSale = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.id_customer){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }else if(!req.body.is_credit && !req.body.payment){
        return res.status(200).json({
            success: false,
            message: `Una venta al contado debe tener un pago.`,
        });
    } // END IF

    const { success, message, id_sale} = await Sale.handleCreateSale(req.body);
    // console.log("handleCreateSale",success, message)
    if(!success){
        return res.status(200).json({
            success: false,
            message
        });
    }

    res.status(200).json({
        success: true,
        message,
        newId: id_sale,
        sale: req.body
    });

}); // END getCustomers

// Get all customers   =>   /api/v1/customer/new
exports.createSalePayment = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.id_sale){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }

    const { success, message, id_sale} = await Sale.handleCreatePaymentSale(req.body);
    // console.log("handleCreateSale",success, message)
    if(!success){
        return res.status(200).json({
            success: false,
            message
        });
    }

    res.status(200).json({
        success: true,
        message,
        newId: id_sale,
        sale: req.body
    });

}); // END createBuy