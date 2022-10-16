const express = require('express');
const router = express.Router();

const { 
    getUsers,
    attemptLogin,
    createUser
} = require('../controllers/authController');

// Attempt Login
router.route('/login').post(attemptLogin);
// Get all users
router.route('/users').get(getUsers);
// // Get single todo
// router.route('/todo/:id').get(getSingleTodo);
// Create user
router.route('/user/new').post(createUser);
// // Update todo
// router.route('/todo/:id').patch(updateTodo);
// // Delete todo
// router.route('/todo/:id').delete(deleteTodo);

module.exports = router;
