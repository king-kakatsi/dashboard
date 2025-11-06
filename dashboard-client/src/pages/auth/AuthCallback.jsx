import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveInLocalStorage } from '../../services/localStorageService';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    // console.log("DEBUG oatuth token received", token)
    if (token) {
      // Save token to localStorage
      saveInLocalStorage('access_token', token)
      
      // Redirect to dashboard
      navigate('/', { replace: true });
    } else {
      // No token found, redirect to login
      console.error('No token received from OAuth');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>
        <h2>Logging you in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};