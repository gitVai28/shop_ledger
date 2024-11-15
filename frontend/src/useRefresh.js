import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useRefresh = (setIsAuthenticated) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      if (
        location.pathname !== '/login' &&
        location.pathname !== '/signup'
      ) {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, navigate]);
};

export default useRefresh;