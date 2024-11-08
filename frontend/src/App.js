import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './Pages/LogIn';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import Customers from './Pages/Customers';
import Header from './Components/Header';
import useRefresh from './useRefresh';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsAuthenticated(!!token);
  }, []);

  useRefresh(setIsAuthenticated);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showHeader = isAuthenticated && location.pathname !== '/login';

  return (
    <div className="app-container">
      {showHeader && (
        <Header onLogout={handleLogout} className="header-container">
          <button onClick={toggleTheme} className="theme-toggle">
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </Header>
      )}
      <div className="route-container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="/customers" element={<PrivateRoute element={<Customers />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
