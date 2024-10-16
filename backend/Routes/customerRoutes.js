// backend/Routes/CustomerRouter.js
const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const { addCustomer, getCustomers, updateCustomer, deleteCustomer } = require('../Controllers/customerController');

// Route to add a new customer
router.post('/add', ensureAuthenticated, addCustomer);

// Route to get all customers
router.get('/', ensureAuthenticated, getCustomers);

// Route to update a customer
router.put('/:customerId', ensureAuthenticated, updateCustomer);

// Route to delete a customer
router.delete('/:customerId', ensureAuthenticated, deleteCustomer);

module.exports = router;
