import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function BillGenerator({ isOpen, onClose, onBillGenerated }) {
  const [products, setProducts] = useState([]);
  const [billData, setBillData] = useState({
    customerName: '',
    phoneNo: '',
    selectedProducts: [],
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  
  const jwtToken = localStorage.getItem('jwtToken');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('https://shop-ledger-backend.onrender.com/products', {
        headers: {
          'Authorization': jwtToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      } else {
        toast.error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    }
  }, [jwtToken]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProduct = () => {
    setBillData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, { productName: '', quantity: 1, price: 0, subtotal: 0 }]
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...billData.selectedProducts];
    
    if (field === 'productName') {
      const selectedProduct = products.find(p => p.productName === value);
      updatedProducts[index] = {
        ...updatedProducts[index],
        productName: value,
        price: selectedProduct?.price || 0,
        subtotal: selectedProduct?.price * updatedProducts[index].quantity || 0
      };
    } else if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      const product = products.find(p => p.productName === updatedProducts[index].productName);
      if (product && quantity > product.quantity) {
        toast.error(`Only ${product.quantity} units available`);
        return;
      }
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity,
        subtotal: updatedProducts[index].price * quantity
      };
    }

    const totalAmount = updatedProducts.reduce((sum, product) => sum + product.subtotal, 0);
    
    setBillData(prev => ({
      ...prev,
      selectedProducts: updatedProducts,
      totalAmount,
      pendingAmount: totalAmount - prev.paidAmount
    }));
  };

  const removeProduct = (index) => {
    const updatedProducts = billData.selectedProducts.filter((_, i) => i !== index);
    const totalAmount = updatedProducts.reduce((sum, product) => sum + product.subtotal, 0);
    
    setBillData(prev => ({
      ...prev,
      selectedProducts: updatedProducts,
      totalAmount,
      pendingAmount: totalAmount - prev.paidAmount
    }));
  };

  const handlePaidAmountChange = (e) => {
    const paidAmount = parseFloat(e.target.value) || 0;
    setBillData(prev => ({
      ...prev,
      paidAmount,
      pendingAmount: prev.totalAmount - paidAmount
    }));
  };

  const generateBill = async () => {
    if (!billData.customerName || billData.selectedProducts.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('https://shop-ledger-backend.onrender.com/customers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken,
        },
        body: JSON.stringify({
          customerName: billData.customerName,
          phoneNo: billData.phoneNo,
          purchasedProducts: billData.selectedProducts.map(product => ({
            productName: product.productName,
            quantity: product.quantity
          })),
          totalAmount: billData.totalAmount,
          paidAmount: billData.paidAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bill generated and customer added successfully');
        onClose();
        onBillGenerated(); // Call this to refresh the customer list in the parent component
      } else {
        toast.error(data.message || 'Failed to generate bill');
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error('Error generating bill');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Generate Bill</h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>
        
        <div className="bill-form">
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={billData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNo">Phone Number</label>
            <input
              type="text"
              id="phoneNo"
              name="phoneNo"
              value={billData.phoneNo}
              onChange={handleInputChange}
            />
          </div>

          <div className="products-section">
            <h3>Products</h3>
            <button onClick={addProduct} className="add-product-btn">Add Product</button>
            
            {billData.selectedProducts.map((product, index) => (
              <div key={index} className="product-row">
                <select
                  value={product.productName}
                  onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p.productName}>{p.productName} (Available: {p.quantity})</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                  min="1"
                />
                
                <span className="subtotal">₹{product.subtotal}</span>
                
                <button onClick={() => removeProduct(index)} className="remove-product-btn">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bill-summary">
            <div className="summary-row">
              <span>Total Amount:</span>
              <span>₹{billData.totalAmount}</span>
            </div>
            
            <div className="summary-row">
              <label htmlFor="paidAmount">Paid Amount:</label>
              <input
                type="number"
                id="paidAmount"
                value={billData.paidAmount}
                onChange={handlePaidAmountChange}
              />
            </div>
            
            <div className="summary-row">
              <span>Pending Amount:</span>
              <span>₹{billData.pendingAmount}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={generateBill} className="generate-btn">
            Generate Bill & Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillGenerator;