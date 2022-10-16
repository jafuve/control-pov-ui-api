const Subsidiary = require('../models/subsidiaryModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all customers   =>   /api/v1/customers
exports.getSubsidiaries = catchAsyncErrors( async(req, res, next) => {
    
    const { results } = await Subsidiary.getSubsidiaries();

    res.status(200).json({
        success: true,
        results
    });

}); // END getSubsidiaries

// Get all customers   =>   /api/v1/customers
exports.getSubsidiary = catchAsyncErrors( async(req, res, next) => {
    
    const { success, message, results } = await Subsidiary.getSubsidiary(req.params.id);

    if(!success){
        return res.status(200).json({
            success,
            message
        });
    }

    res.status(200).json({
        success: true,
        results
    });

}); // END getSubsidiaries
