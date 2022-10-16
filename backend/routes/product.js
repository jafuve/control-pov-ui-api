const express = require('express');
const router = express.Router();

const { 
    getProducts,
    getProduct,
    createProduct,
    getProductBrands,
    createProductBrand,
    getProductCategories,
    createProductCategory,
    getProductMeassures,
    createProductMeassure
} = require('../controllers/productController');

// Get all
router.route('/products').get(getProducts);
// Get single todo
router.route('/product/:id').get(getProduct);
// Create
router.route('/product/new').post(createProduct);
// // Update todo
// router.route('/todo/:id').patch(updateTodo);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

/*************************************************************************
 * PRODUCT BRAND SECTION - START
 *************************************************************************/
// Get all
router.route('/brands').get(getProductBrands);
// Create
router.route('/brand/new').post(createProductBrand);
/*************************************************************************
 * PRODUCT BRAND SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT CATEGORY SECTION - START
 *************************************************************************/
// Get all
router.route('/categories').get(getProductCategories);
// Create
router.route('/category/new').post(createProductCategory);
/*************************************************************************
 * PRODUCT CATEGORY SECTION - END
 *************************************************************************/

/*************************************************************************
 * PRODUCT MEASSURE SECTION - START
 *************************************************************************/
// Get all
router.route('/meassures').get(getProductMeassures);
// Create
router.route('/meassure/new').post(createProductMeassure);
/*************************************************************************
 * PRODUCT MEASSURE SECTION - END
 *************************************************************************/

module.exports = router;
