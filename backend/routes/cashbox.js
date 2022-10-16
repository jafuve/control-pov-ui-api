const express = require('express');
const router = express.Router();

const { 
    getCashboxFlowRecords,
    createCashboxFlowRecord,
    updateCashboxFlowRecord
} = require('../controllers/cashboxController');

// Get all customers
router.route('/cashboxflow-records').get(getCashboxFlowRecords);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create customer
router.route('/cashboxflow/new').post(createCashboxFlowRecord);
// Update todo
router.route('/cashboxflow/:id').patch(updateCashboxFlowRecord);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
