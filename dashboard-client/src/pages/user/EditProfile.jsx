
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../controllers/userController';
import Navigation from '../../components/user/Nav';
import Alert from '../../components/Alert';
import { fetchFromLocalStorage } from '../../services/localStorageService';

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const access_token = fetchFromLocalStorage('access_token');
      const storedUser = fetchFromLocalStorage('user');
      const id = storedUser?.id;
      
      if (!access_token) {
        navigate('/login');
        return;
      }

      const [isSuccess, data] = await getUserProfile(id);
      
      if (isSuccess) {
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || ''
        });
      } else {
        setErrors({ message: data?.message || 'Failed to load profile' });
      }
      setLoading(false);
    };
    
    loadProfile();

    if (location.state?.success) {
      setSuccess(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [userId, navigate, location]);

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

    const storedUser = fetchFromLocalStorage('user');
    const updatePayload = {};
    
    if (formData.username !== user.username) {
      updatePayload.standByUsername = formData.username;
    }
    
    if (formData.email !== user.email) {
      updatePayload.standByEmail = formData.email;
    }

    if (Object.keys(updatePayload).length === 0) {
      setErrors({ message: 'No changes detected' });
      setSubmitting(false);
      return;
    }

    const [isSuccess, data] = await updateUserProfile(storedUser?.id, updatePayload);

    if (isSuccess) {
      setSuccess({ 
        message: data?.message || 'Confirmation email sent! Please check your inbox.' 
      });
      setErrors(null);
    } else {
      setErrors({ message: data?.message || 'Failed to update profile' });
      setSuccess(null);
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
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your personal information</p>
          </div>

          <Alert type="error" message={errors?.message} />
          <Alert type="success" message={success?.message} />

          <form onSubmit={handleSubmit}>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input 
                type="text" 
                name="username" 
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                required
                minLength="3"
                className="w-full text-gray-600 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {user?.standByUsername && (
                <p className="mt-1 text-sm text-amber-600">
                  <i className="fas fa-clock mr-1"></i>
                  Pending: <strong>{user.standByUsername}</strong>
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full text-gray-600 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {user?.standByEmail && (
                <p className="mt-1 text-sm text-amber-600">
                  <i className="fas fa-clock mr-1"></i>
                  Pending: <strong>{user.standByEmail}</strong>
                </p>
              )}
            </div> 

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#FF214F' }}
                className="flex-1 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>Save Changes
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

export default EditProfile;
