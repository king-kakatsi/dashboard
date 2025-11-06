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
          <a href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            {/* <i className="fas fa-chart-line"></i> */}
            {user?.username ?? 'User profile'}
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-white hover:text-gray-200 transition-colors">
              <i className="fas fa-home mr-2"></i>Home
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
