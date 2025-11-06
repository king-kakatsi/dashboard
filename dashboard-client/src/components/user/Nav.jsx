import React from 'react';

const Nav = () => {
  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <i className="fas fa-chart-line"></i>
            Dashboard
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-white hover:text-gray-200 transition-colors">
              <i className="fas fa-home mr-2"></i>Home
            </a>
            <a href="/auth/logout" className="text-white hover:text-gray-200 transition-colors">
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
