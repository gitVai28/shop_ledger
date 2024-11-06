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
    <div className="headercontainer">
      <div className="header-content">
        <h1>Welcome to Shop Ledger, {loggedInUser}</h1>
        <div className="button-group">
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </div>
      </div>
      <div className="nav-links">
        <Link to="/home" className="navlink">
          Home
        </Link>
        <Link to="/customers" className="navlink">
          Customers
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Header;