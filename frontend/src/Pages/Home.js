import React from 'react';

import ProductTable from '../Components/ProductTable';
import './Home.css';

function Home() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Products Dashboard</h2>
      <ProductTable className="product-table" />
    </div>
  );
  
}

export default Home;