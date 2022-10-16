const express = require('express');
const router = express.Router();

const { 
    getSuppliers,
    createSupplier
} = require('../controllers/supplierController');

// Get all customers
router.route('/suppliers').get(getSuppliers);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/supplier/new').post(createSupplier);
// // Update todo
// router.route('/todo/:id').patch(updateTodo);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
