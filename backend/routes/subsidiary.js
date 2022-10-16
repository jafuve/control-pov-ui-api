const express = require('express');
const router = express.Router();

const { 
    getSubsidiaries, getSubsidiary
} = require('../controllers/subsidiaryController');

// Get all customers
router.route('/subsidiaries').get(getSubsidiaries);
// // Get single todo
router.route('/subsidiary/:id').get(getSubsidiary);
// Create customer
// router.route('/customer/new').post(createCustomer);
// // Update todo
// router.route('/todo/:id').patch(updateTodo);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
