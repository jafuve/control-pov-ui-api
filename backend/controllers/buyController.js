const Buy = require('../models/buyModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all customers   =>   /api/v1/customer/new
exports.getProducBuyRecords = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.from || !req.body.to ){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }

    const { success, message, results} = await Buy.getProductBuyRecords(req.body.from, req.body.to, req.query.type);
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

}); // END createBuy

// Get all customers   =>   /api/v1/customer/new
exports.createBuy = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.id_supplier){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }else if(!req.body.is_credit && !req.body.payment){
        return res.status(200).json({
            success: false,
            message: `Una compra al contado debe tener un pago.`,
        });
    } // END IF

    const { success, message, id_sale} = await Buy.handleCreateBuy(req.body);
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

// Get all customers   =>   /api/v1/customer/new
exports.createBuyPayment = catchAsyncErrors( async(req, res, next) => {
    
    if(!req.body.id_buy){
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    }

    const { success, message, id_sale} = await Buy.handleCreatePaymentBuy(req.body);
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