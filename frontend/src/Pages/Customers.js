import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BillGenerator from '../Components/BillGenerator';
import './Customers.css';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [billModalIsOpen, setBillModalIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ paidAmount: '' });
  const [shopDetails, setShopDetails] = useState({ name: '', contactNo: '', address: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('jwtToken');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://shop-ledger-backend.onrender.com/customers', {
        headers: { 'Authorization': jwtToken },
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
        headers: { 'Authorization': jwtToken },
      });
      const data = await response.json();
      if (response.ok) {
        setShopDetails({
          name: data.user.shopName,
          contactNo: data.user.phoneNo,
           address: data.user.shopAddress || 'N/A'
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
        headers: { 'Authorization': jwtToken },
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
    setFormData({ paidAmount: '' });
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      const newPaidAmount = parseFloat(selectedCustomer.paidAmount) + parseFloat(formData.paidAmount);
      const updatedCustomerData = {
        ...selectedCustomer,
        paidAmount: newPaidAmount,
        pendingAmount: selectedCustomer.totalAmount - newPaidAmount
      };

      const response = await fetch(`https://shop-ledger-backend.onrender.com/customers/${selectedCustomer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken,
        },
        body: JSON.stringify(updatedCustomerData),
      });

      if (response.ok) {
        const { customer: updatedCustomer } = await response.json();
        setCustomers(customers.map(customer =>
          customer._id === updatedCustomer._id
            ? {
                ...customer,
                ...updatedCustomer,
                purchasedProducts: customer.purchasedProducts,
                customerPhone: customer.customerPhone,
              }
            : customer
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
    if (!customer || !customer.purchasedProducts) {
      toast.error('Invalid customer data for receipt generation');
      return;
    }

    const receiptContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .receipt { 
              width: 400px; 
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .shop-name {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              padding: 10px 0;
            }
            .customer-info {
              background-color: #f8f8f8;
              padding: 10px;
              border-radius: 5px;
              margin: 15px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin: 20px 0;
            }
            th { 
              background-color: #f2f2f2;
              padding: 12px 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            td { 
              padding: 10px 8px;
              border: 1px solid #ddd;
            }
            .total-section {
              margin: 20px 0;
              padding: 10px;
              border-top: 1px solid #ddd;
              border-bottom: 1px solid #ddd;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px dashed #ddd;
            }
            .shop-details {
              margin-top: 15px;
              font-size: 0.9em;
              color: #666;
            }
            .thank-you {
              font-size: 1.1em;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1 class="shop-name">${shopDetails.name}</h1>
            </div>

            <div class="customer-info">
              <p><strong>Customer:</strong> ${customer.customerName}</p>
              <p><strong>Phone:</strong> ${customer.customerPhone}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <table>
              <tr>
                <th>Product</th>
                <th>Price per Item</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
              ${customer.purchasedProducts.map(product => `
                <tr>
                  <td>${product.productId?.productName || 'N/A'}</td>
                  <td>₹${(product.productId?.price || 0).toFixed(2)}</td>
                  <td>${product.quantity}</td>
                  <td>₹${((product.productId?.price || 0) * product.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>

            <div class="total-section">
              <div class="amount-row">
                <span><strong>Total Amount:</strong></span>
                <span>₹${customer.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="amount-row">
                <span><strong>Paid Amount:</strong></span>
                <span>₹${customer.paidAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="amount-row">
                <span><strong>Pending Amount:</strong></span>
                <span>₹${customer.pendingAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div class="footer">
              <p class="thank-you">Thank you for your visit!</p>
              <div class="shop-details">
                <p><strong>Address:</strong> ${shopDetails.address}</p>
                <p><strong>Contact:</strong> ${shopDetails.contactNo}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="customer-container">
      <h2>Customers</h2>
      <div className="customer-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search customers by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <button onClick={() => setBillModalIsOpen(true)} className="generate-bill-btn">
          Generate Bill
        </button>
      </div>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : filteredCustomers.length === 0 ? (
        <p>No matching customers found.</p>
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
            {filteredCustomers.map(customer => (
              <tr 
                key={customer._id} 
                className={customer.pendingAmount > 0 ? 'pending-bill' : ''}
              >
                <td>{customer.customerName}</td>
                <td>
                  {customer.purchasedProducts && customer.purchasedProducts.map((product, index) => (
                    <div key={index}>
                      {product.productId?.productName || 'N/A'} - {product.quantity}
                    </div>
                  ))}
                </td>
                <td>{customer.totalAmount?.toFixed(2) || '0.00'}</td>
                <td>{customer.paidAmount?.toFixed(2) || '0.00'}</td>
                <td>{customer.pendingAmount?.toFixed(2) || '0.00'}</td>
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
                <p>Total Bill: ₹{selectedCustomer.totalAmount?.toFixed(2) || '0.00'}</p>
                <p>Current Paid Amount: ₹{selectedCustomer.paidAmount?.toFixed(2) || '0.00'}</p>
                <p>Current Pending Bill: ₹{selectedCustomer.pendingAmount?.toFixed(2) || '0.00'}</p>
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
