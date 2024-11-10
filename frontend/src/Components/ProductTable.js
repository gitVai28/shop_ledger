import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductTable.css';

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [newProduct, setNewProduct] = useState({
    productName: '',
    quantity: '',
    price: '',
    date: ''
  });

  const jwtToken = localStorage.getItem('jwtToken');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://shop-ledger-backend.onrender.com/products', {
        method: 'GET',
        headers: {
          Authorization: jwtToken,
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error('Unexpected API response format:', data);
        toast.error('Error fetching products: Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    if (jwtToken) {
      fetchProducts();
    } else {
      console.error('JWT token not found');
      toast.error('Authentication required');
      setIsLoading(false);
    }
  }, [jwtToken, fetchProducts]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://shop-ledger-backend.onrender.com/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: jwtToken,
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditProduct({ ...editProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://shop-ledger-backend.onrender.com/products/${editProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwtToken,
        },
        body: JSON.stringify(editProduct),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Product updated successfully');
        setShowEditModal(false);
        fetchProducts();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://shop-ledger-backend.onrender.com/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken,
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Product added successfully');
        setShowAddModal(false);
        setNewProduct({
          productName: '',
          quantity: '',
          price: '',
          date: ''
        });
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-table-container">
      <h2>Product Collection</h2>
      
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
  
        <button onClick={() => setShowAddModal(true)} className="add-product-btn">
          Add Product
        </button>
      </div>
  
      {isLoading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (INR)</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.productName}</td>
                  <td style={{ color: product.quantity === 0 ? 'red' : 'black' }}>
                    {product.quantity}
                  </td>
                  <td>{product.price}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No products found.</p>
      )}
  
      {showEditModal && editProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <div>
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={editProduct.productName}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>
  
              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={editProduct.quantity}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>
  
              <div>
                <label>Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  value={editProduct.price}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>
  
              <div className="modal-footer">
                <button type="button" className="close-btn" onClick={() => setShowEditModal(false)}>Close</button>
                <button type="submit" className="submit-btn">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Product</h2>
            <form onSubmit={handleAddProduct}>
              <div>
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={newProduct.productName}
                  onChange={handleChange}
                  required
                />
              </div>
  
              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
  
              <div>
                <label>Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleChange}
                  required
                />
              </div>
  
              <div>
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newProduct.date}
                  onChange={handleChange}
                  required
                />
              </div>
  
              <div className="modal-footer">
                <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>Close</button>
                <button type="submit" className="submit-btn">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      <ToastContainer />
    </div>
  );
}

export default ProductTable;