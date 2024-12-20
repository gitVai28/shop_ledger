import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useRefresh = (setIsAuthenticated) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('jwtToken')) {
      setIsAuthenticated(true);
      if (
        
        location.pathname === '/login' ||
        location.pathname === '/signup'
      ) {
        navigate('/', { replace: false });
      }
    }
  }, [location, navigate, setIsAuthenticated]);
};

export default useRefresh;