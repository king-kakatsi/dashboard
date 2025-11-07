import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFromLocalStorage } from '../../services/localStorageService';
import { logout } from '../../controllers/userController';

const Nav = () => {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = fetchFromLocalStorage('access_token');
    const currentUser = fetchFromLocalStorage('user');
    if (!access_token) {
      navigate('/profile');
      return;
    }
    
    setUser(() => ({ ...currentUser }));
  }, []);


  const handleLogout = async () => {
    const result = await logout();
    if (result) navigate('/login');
  };


  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/profile" className="flex items-center gap-2 text-white font-bold text-xl">
            {/* <i className="fas fa-chart-line"></i> */}
            {user?.username ?? 'User profile'}
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-white hover:text-gray-200 transition-colors flex items-center">
              <svg className="w-5 h-5 mr-1" style={{ color: '#FF214F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
            </svg>
              Dashboard
            </a>
            <button href="/auth/logout" onClick={handleLogout} className="text-white hover:text-gray-200 transition-colors">
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
