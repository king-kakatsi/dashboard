import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFromLocalStorage } from '../../services/localStorageService';
import { logout } from '../../controllers/userController';

const Nav = () => {

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = fetchFromLocalStorage('access_token');
    const currentUser = fetchFromLocalStorage('user');
    if (!access_token) {
      navigate('/login');
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
          <Link to="/profile" className="flex items-center gap-2 text-white font-bold text-xl min-h-[44px]">
            {user?.username ?? 'User profile'}
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-white hover:text-gray-200 transition-colors flex items-center min-h-[44px]">
              <svg className="w-5 h-5 mr-1" style={{ color: '#FF214F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
            </svg>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-white hover:text-gray-200 transition-colors min-h-[44px]">
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
          </div>
          <button
            className="md:hidden text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link
              to="/"
              className="text-white hover:text-gray-200 transition-colors min-h-[44px] flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-200 transition-colors min-h-[44px] flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
