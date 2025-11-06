import React, { useState } from 'react';
import Navigation from './Navigation';
import Alert from './Alert';

const ChangePassword = ({ user, errors, success }) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navigation user={user} />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
          
          <div className="mb-8 text-center">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" 
              style={{ backgroundColor: 'rgba(255, 33, 79, 0.1)' }}
            >
              <i className="fas fa-key text-3xl" style={{ color: '#FF214F' }}></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600">Update your password to keep your account secure</p>
          </div>

          <Alert type="success" message={success?.message} />
          <Alert type="error" message={errors?.message} />

          <form action={`/users/${user?.id}/profile/change-password`} method="POST">
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword" 
                  placeholder="Enter current password"
                  required
                  minLength="6"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={`far ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword" 
                  placeholder="Enter new password"
                  required
                  minLength="6"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={`far ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <i className="fas fa-info-circle"></i> Minimum 6 characters
              </p>
            </div>

            <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                <i className="fas fa-shield-alt" style={{ color: '#FF214F' }}></i> Password Tips:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Use at least 8 characters</li>
                <li>Mix uppercase and lowercase letters</li>
                <li>Include numbers and symbols</li>
                <li>Avoid common words or patterns</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                style={{ backgroundColor: '#FF214F' }}
                className="flex-1 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <i className="fas fa-lock mr-2"></i>Update Password
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ChangePassword;