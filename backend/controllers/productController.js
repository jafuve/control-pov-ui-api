const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { google } = require('googleapis');

// Get all products   =>   /api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {

    const { success, origin, message, results } = await Product.getProducts();

    if (!success) {
        return res.status(200).json({
            success,
            origin,
            message
        });
    }

    res.status(200).json({
        success: true,
        results
    });

}); // END getProducts

exports.getProduct = catchAsyncErrors(async (req, res, next) => {

    const { success, origin, message, results } = await Product.getProduct(req.params.id);

    if (!success) {
        return res.status(200).json({
            success,
            origin,
            message
        });
    }

    res.status(200).json({
        success: true,
        data: results
    });

}); // END getProducts

// Create product   =>   /api/v1/product/new
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.name) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Product.createProduct(req.body);

    if (!resCreate.success) {
        return res.status(200).json(resCreate);
    }
    req.body.id_product = resCreate.results.insertId;

    res.status(200).json({
        success: true,
        message: `Producto creado con éxito`,
        newId: resCreate.results.insertId,
        product: req.body
    });

}); // END getCustomers

/*************************************************************************
 * PRODUCT BRAND SECTION - START
 *************************************************************************/
// Get all brands   =>   /api/v1/brands
exports.getProductBrands = catchAsyncErrors(async (req, res, next) => {

    const { success, message, results } = await Product.getProductBrands();

    if (!success) {
        return res.status(200).json({
            success: false,
            message
        });
    }

    res.status(200).json({
        success: true,
        results
    });

}); // END getProductBrands

// Create product brand   =>   /api/v1/product/new
exports.createProductBrand = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.product_brand) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Product.createProductBrand(req.body);

    if (!resCreate.success) {
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    req.body.id_product_brand = resCreate.results.insertId;

    res.status(200).json({
        success: true,
        message: `Marca creada con éxito`,
        newId: resCreate.results.insertId,
        brand: req.body
    });

}); // END getCustomers
/*************************************************************************
 * PRODUCT BRAND SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT BRAND SECTION - START
 *************************************************************************/
// Get all brands   =>   /api/v1/brands
exports.getProductCategories = catchAsyncErrors(async (req, res, next) => {

    const { results } = await Product.getProductCategories();

    res.status(200).json({
        success: true,
        results
    });

}); // END getProductBrands

// Create product brand   =>   /api/v1/product/new
exports.createProductCategory = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.product_category) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Product.createProductCategory(req.body);

    if (!resCreate.success) {
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    req.body.id_product_category = resCreate.results.insertId,

        res.status(200).json({
            success: true,
            message: `Categoría creada con éxito`,
            newId: resCreate.results.insertId,
            category: req.body
        });

}); // END getCustomers
/*************************************************************************
 * PRODUCT BRAND SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT BRAND SECTION - START
 *************************************************************************/
// Get all brands   =>   /api/v1/brands
exports.getProductMeassures = catchAsyncErrors(async (req, res, next) => {

    const { results } = await Product.getProductMeassures();

    res.status(200).json({
        success: true,
        results
    });

}); // END getProductBrands

// Create product brand   =>   /api/v1/product/new
exports.createProductMeassure = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.body)

    if (!req.body.product_meassure) {
        return res.status(200).json({
            success: false,
            message: `No se ha recibido la información necesaria.`,
        });
    } // END IF

    const resCreate = await Product.createProductMeassure(req.body);

    if (!resCreate.success) {
        return res.status(200).json({
            success: false,
            message: resCreate.message
        });
    }

    req.body.id_product_meassure = resCreate.results.insertId;

    res.status(200).json({
        success: true,
        message: `Medida creada con éxito`,
        newId: resCreate.results.insertId,
        meassure: req.body
    });

}); // END getCustomers
/*************************************************************************
 * PRODUCT BRAND SECTION - END
 *************************************************************************/