import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveInLocalStorage } from '../../services/localStorageService';

/**
 * Completes the OAuth handoff from the backend redirect.
 *
 * Saves the query token and user id into local storage, then replaces the
 * history entry so the token leaves the address bar immediately.
 */
export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    if (token) {
      // Save token to localStorage
      saveInLocalStorage('access_token', token)
      if (id) saveInLocalStorage('user', {id})
      
      // Redirect to dashboard
      navigate('/', { replace: true });
    } else {
      // No token found, redirect to login
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