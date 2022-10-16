const express = require('express');
const router = express.Router();

const { 
    createBuyPayment
} = require('../controllers/buyController');

// Get sale records
// router.route('/buy-payments').get(getProducBuyRecords);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/buy-payment/new').post(createBuyPayment);
// Update todo
// router.route('/cashboxflow/:id').patch(updateCashboxFlowRecord);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
