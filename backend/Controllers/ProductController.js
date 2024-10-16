const ProductModel = require('../Models/Product');

// Add a new product
const addProduct = async (req, res) => {
    try {
        const { productName, price, quantity } = req.body;
        const userId = req.user._id; // Retrieved from ensureAuthenticated middleware

        const newProduct = new ProductModel({
            productName,
            price,
            quantity,
            user: userId
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product added successfully",
            success: true,
            product: newProduct
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get all products added by the authenticated user
const getProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const products = await ProductModel.find({ user: userId });

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        const { productName, price, quantity } = req.body;

        const product = await ProductModel.findOne({ _id: productId, user: userId });
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        product.productName = productName !== undefined ? productName : product.productName;
        product.price = price !== undefined ? price : product.price;
        product.quantity = quantity !== undefined ? quantity : product.quantity;

        await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            success: true,
            product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;

        const product = await ProductModel.findOneAndDelete({ _id: productId, user: userId });

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
};
