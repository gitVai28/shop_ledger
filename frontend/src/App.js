import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Pages/LogIn';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import Customers from './Pages/Customers';
import Header from './Components/Header';  // Import the Header component
import { useState } from 'react';
import useRefresh from './useRefresh';  

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  useRefresh(setIsAuthenticated);

  return (
    <div className="App">
      {isAuthenticated && <Header />} {/* Render Header if authenticated */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/customers" element={<PrivateRoute element={<Customers />} />} /> {/* New Route */}
      </Routes>
    </div>
  );
}

export default App;
