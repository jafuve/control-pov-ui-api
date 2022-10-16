const express = require('express');
const router = express.Router();

const { 
    createSalePayment
} = require('../controllers/saleController');

// Get sale records
// router.route('/buy-payments').get(getProducBuyRecords);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/sale-payment/new').post(createSalePayment);
// Update todo
// router.route('/cashboxflow/:id').patch(updateCashboxFlowRecord);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
