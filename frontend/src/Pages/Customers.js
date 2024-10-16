// Customers.js
import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BillGenerator from '../Components/BillGenerator';
import './Customers.css'; // Make sure to create this CSS file

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [billModalIsOpen, setBillModalIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    paidAmount: '',
  });
  const [shopDetails, setShopDetails] = useState({ name: '', contactNo: '' });
  const jwtToken = localStorage.getItem('jwtToken');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://shop-ledger-backend.onrender.com/customers', {
        headers: {
          'Authorization': jwtToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [jwtToken]);

  const fetchShopDetails = useCallback(async () => {
    try {
      const response = await fetch('https://shop-ledger-backend.onrender.com/auth/user-details', {
        headers: {
          'Authorization': jwtToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setShopDetails({
          name: data.user.shopName,
          contactNo: data.user.phoneNo
        });
      } else {
        throw new Error('Failed to fetch shop details');
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      toast.error('Error fetching shop details');
    }
  }, [jwtToken]);

  useEffect(() => {
    fetchCustomers();
    fetchShopDetails();
  }, [fetchCustomers, fetchShopDetails]);

  const handleDelete = async (customerId) => {
    try {
      const response = await fetch(`https://shop-ledger-backend.onrender.com/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': jwtToken,
        },
      });

      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== customerId));
        toast.success('Customer deleted successfully');
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      paidAmount: '',
    });
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    try {
      const newPaidAmount = parseFloat(selectedCustomer.paidAmount) + parseFloat(formData.paidAmount);
      const response = await fetch(`https://shop-ledger-backend.onrender.com/customers/${selectedCustomer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken,
        },
        body: JSON.stringify({ paidAmount: newPaidAmount }),
      });

      if (response.ok) {
        const { customer: updatedCustomer } = await response.json();
        setCustomers(customers.map(customer =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        ));
        toast.success('Customer updated successfully');
        closeEditModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update customer');
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const generateReceipt = (customer) => {
    const receiptContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt { width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${shopDetails.name}</h2>
              <p>Customer: ${customer.customerName}</p>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            <table>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
              ${customer.purchasedProducts.map(product => `
                <tr>
                  <td>${product.productId?.productName || 'N/A'}</td>
                  <td>${product.quantity}</td>
                  <td>₹${((product.productId?.price || 0) * product.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <div class="total">
              <p>Total Amount: ₹${customer.totalAmount?.toFixed(2)}</p>
              <p>Paid Amount: ₹${customer.paidAmount?.toFixed(2)}</p>
              <p>Pending Amount: ₹${customer.pendingAmount?.toFixed(2)}</p>
            </div>
            <p>Shop Contact: ${shopDetails.contactNo}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };


  if (loading) {
    return <div>Loading customers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="customer-container">
      <h2>Customers</h2>
      <button onClick={() => setBillModalIsOpen(true)} className="generate-bill-btn">
        Generate Bill
      </button>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Purchased Products</th>
              <th>Total Bill (INR)</th>
              <th>Paid Bill (INR)</th>
              <th>Pending Bill (INR)</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer._id}>
                <td>{customer.customerName}</td>
                <td>
                  {customer.purchasedProducts && customer.purchasedProducts.map((product, index) => (
                    <div key={index}>
                      {product.productId?.productName} - {product.quantity}
                    </div>
                  ))}
                </td>
                <td>{customer.totalAmount?.toFixed(2)}</td>
                <td>{customer.paidAmount?.toFixed(2)}</td>
                <td>{customer.pendingAmount?.toFixed(2)}</td>
                <td>{customer.customerPhone}</td>
                <td>
                  <button onClick={() => handleEdit(customer)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(customer._id)} className="delete-btn">Delete</button>
                  <button onClick={() => generateReceipt(customer)} className="print-btn">Print Receipt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editModalIsOpen && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Paid Bill for {selectedCustomer.customerName}</h2>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <p>Total Bill: ₹{selectedCustomer.totalAmount?.toFixed(2)}</p>
                <p>Current Paid Amount: ₹{selectedCustomer.paidAmount?.toFixed(2)}</p>
                <p>Current Pending Bill: ₹{selectedCustomer.pendingAmount?.toFixed(2)}</p>
                <label htmlFor="paidAmount">Additional Amount Paid (INR)</label>
                <input
                  type="number"
                  id="paidAmount"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <button type="submit" className="update-btn">Update Payment</button>
            </form>
          </div>
        </div>
      )}

      {billModalIsOpen && (
        <BillGenerator 
          isOpen={billModalIsOpen} 
          onClose={() => setBillModalIsOpen(false)}
          onBillGenerated={fetchCustomers}
        />
      )}
      
      <ToastContainer />
    </div>
  );
}

export default Customer;