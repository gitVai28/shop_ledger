const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const { addProduct, getProducts, updateProduct, deleteProduct } = require('../Controllers/ProductController');

// Route to add a new product
router.post('/', ensureAuthenticated, addProduct);

// Route to get all products for the authenticated user
router.get('/', ensureAuthenticated, getProducts);

// Route to update a specific product by ID
router.put('/:id', ensureAuthenticated, updateProduct);

// Route to delete a specific product by ID
router.delete('/:id', ensureAuthenticated, deleteProduct);

module.exports = router;
