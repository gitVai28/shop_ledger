// backend/Models/customerModel.js
const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    customerName: {
        type: String,
        
    },
    purchasedProducts: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'products', // Reference to Product model
            
        },
        quantity: {
            type: Number,
            
        }
    }],
    totalAmount: {
        type: Number,
       
    },
    paidAmount: {
        type: Number,
        
    },
    pendingAmount: {
        type: Number,
        
    },
    customerPhone: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users', // Reference to User model
        
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const CustomerModel = mongoose.model('customers', customerSchema);
module.exports = CustomerModel;
