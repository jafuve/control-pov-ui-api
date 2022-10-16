const express = require('express');
const router = express.Router();

const { 
    getSaleRecords,
    createSale
} = require('../controllers/saleController');

// Get sale records
router.route('/sales').get(getSaleRecords);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/sale/new').post(createSale);
// Update todo
// router.route('/cashboxflow/:id').patch(updateCashboxFlowRecord);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
