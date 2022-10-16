const express = require('express');
const router = express.Router();

const { 
    createBuy,
    getProducBuyRecords
} = require('../controllers/buyController');

// Get sale records
router.route('/buys').get(getProducBuyRecords);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/buy/new').post(createBuy);
// Update todo
// router.route('/cashboxflow/:id').patch(updateCashboxFlowRecord);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
