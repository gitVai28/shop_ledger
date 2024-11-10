import React from 'react';

import ProductTable from '../Components/ProductTable';
import './Home.css';

function Home() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Manage Your Products</h1>
      <ProductTable className="product-table" />
    </div>
  );
  
}

export default Home;