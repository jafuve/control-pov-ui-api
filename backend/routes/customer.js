const express = require('express');
const router = express.Router();

const { 
    getCustomers,
    createCustomer
} = require('../controllers/customerController');

// Get all customers
router.route('/customers').get(getCustomers);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/customer/new').post(createCustomer);
// // Update todo
// router.route('/todo/:id').patch(updateTodo);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
