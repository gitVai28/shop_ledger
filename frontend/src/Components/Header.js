// Header.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem('loggedInUser');

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="header-container">
      <div className="header-content">
        <h1>Welcome to Shop Ledger, {loggedInUser}</h1>
        <div className="button-group">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <nav className="nav-links">
        <Link to="/home" className="nav-link">
          Home
        </Link>
        <Link to="/customers" className="nav-link">
          Customers
        </Link>
      </nav>
      <ToastContainer />
    </div>
  );
}

export default Header;