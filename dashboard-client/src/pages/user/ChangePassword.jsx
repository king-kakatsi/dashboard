import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, changeUserPassword } from '../../controllers/userController';
import Navigation from '../../components/user/Nav';
import Alert from '../../components/Alert';

const ChangePassword = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const id = userId || localStorage.getItem('user_id');
      
      if (!id) {
        navigate('/login');
        return;
      }

      const [isSuccess, data] = await getUserProfile(id);
      
      if (isSuccess) {
        setUser(data);
      } else {
        setErrors({ message: data?.message || 'Failed to load profile' });
      }
      setLoading(false);
    };
    
    loadProfile();
  }, [userId, navigate]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors(null);
    setSuccess(null);

    const id = userId || localStorage.getItem('user_id');
    const [isSuccess, data] = await changeUserPassword(id, formData);

    if (isSuccess) {
      setSuccess({ message: 'Password changed successfully!' });
      setFormData({
        currentPassword: '',
        newPassword: ''
      });
    } else {
      setErrors({ message: data?.message || 'Failed to change password' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <i className="fas fa-spinner fa-spin mr-2"></i>Loading...
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleSubmit}>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
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
                  value={formData.newPassword}
                  onChange={handleChange}
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
                <li>Use at least 6 characters</li>
                <li>Mix uppercase and lowercase letters</li>
                <li>Include numbers and symbols</li>
                <li>Avoid common words or patterns</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(`/users/${user?.id}/profile`)}
                className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#FF214F' }}
                className="flex-1 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock mr-2"></i>Update Password
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
