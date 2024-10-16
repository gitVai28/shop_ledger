// backend/Controllers/customerController.js
const CustomerModel = require('../Models/customerModel');
const ProductModel = require('../Models/Product');

// backend/Controllers/customerController.js

const addCustomer = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Authenticated User:', req.user);

        const { customerName, purchasedProducts, totalAmount, paidAmount, phoneNo } = req.body;

        // Validate required fields
        if (!customerName || !purchasedProducts || purchasedProducts.length === 0 || !totalAmount || paidAmount === undefined || !phoneNo) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        let isValidPurchase = true;
        let totalProductCost = 0;
        let validatedProducts = [];

        // Validate products and adjust quantities
        for (const productItem of purchasedProducts) {
            const product = await ProductModel.findOne({ productName: productItem.productName, user: req.user._id });

            if (!product) {
                return res.status(400).json({ message: `Product ${productItem.productName} not found`, success: false });
            }

            if (product.quantity < productItem.quantity) {
                return res.status(400).json({ message: `Not enough quantity for product ${productItem.productName}`, success: false });
            }

            // Subtract the purchased quantity from product stock
            product.quantity -= productItem.quantity;
            await product.save();

            totalProductCost += product.price * productItem.quantity;
            validatedProducts.push({
                productId: product._id,
                quantity: productItem.quantity
            });
        }

        // Verify total amount
        if (Math.abs(totalProductCost - totalAmount) > 0.01) { // Allow for small floating point discrepancies
            return res.status(400).json({ message: 'Total amount mismatch', success: false });
        }

        // Calculate pending amount
        const pendingAmount = totalAmount - paidAmount;

        // Create new customer record with multiple products
        const newCustomer = new CustomerModel({
            customerName,
            purchasedProducts: validatedProducts,
            totalAmount,
            paidAmount,
            pendingAmount,
            customerPhone: phoneNo,
            createdBy: req.user._id,
        });

        await newCustomer.save();

        res.status(201).json({
            message: 'Customer added successfully',
            success: true,
            customer: newCustomer,
        });
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

// Get all customers
const getCustomers = async (req, res) => {
    try {
        const customers = await CustomerModel.find({ createdBy: req.user._id })
            .populate('purchasedProducts.productId', 'productName price');

        res.status(200).json({
            message: "Customers fetched successfully",
            success: true,
            data: customers
        });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Update a customer
const updateCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { paidAmount } = req.body;

        // Find the customer
        const customer = await CustomerModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found", success: false });
        }

        // Update paidAmount if provided
        if (paidAmount !== undefined) {
            // Ensure paidAmount does not exceed totalAmount
            if (paidAmount > customer.totalAmount) {
                return res.status(400).json({ message: "Paid amount cannot exceed the total amount", success: false });
            }

            // Update the paid amount and recalculate pending amount
            customer.paidAmount = parseFloat(paidAmount);
            customer.pendingAmount = customer.totalAmount - customer.paidAmount;
        }

        // Save the updated customer details
        await customer.save();

        res.status(200).json({
            message: "Customer updated successfully",
            success: true,
            customer: {
                _id: customer._id,
                customerName: customer.customerName,
                totalAmount: customer.totalAmount,
                paidAmount: customer.paidAmount,
                pendingAmount: customer.pendingAmount
            }
        });
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};



// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await CustomerModel.findByIdAndDelete(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found", success: false });
        }

        res.status(200).json({
            message: "Customer deleted successfully",
            success: true
        });

    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

module.exports = {
    addCustomer,
    getCustomers,
    updateCustomer,
    deleteCustomer
};
