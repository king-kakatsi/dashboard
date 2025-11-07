import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDashboard, getUserProfile } from '../../controllers/userController';
import Navigation from '../../components/user/Nav';
import ProfileCard from '../../components/user/ProfileCard';
import ProfileTabs from '../../components/user/ProfileTabs';
import Alert from '../../components/Alert';
import { fetchFromLocalStorage, saveInLocalStorage } from '../../services/localStorageService';
import { getFromApi } from '../../services/axiosService';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const access_token = fetchFromLocalStorage('access_token');
      const user = fetchFromLocalStorage('user');
      const result = await getUserDashboard();
      
      const allWidgets = await getFromApi("http://localhost:3000/widgets");
      const allConnectors = await getFromApi("http://localhost:3000/connectors");
      console.log('DEBUG', allWidgets, allConnectors);

      if (user && result[0]){
        user.connectors = result[1].connectors;
        user.widgets = result[1].widgets;
        saveInLocalStorage('user', user);
      }
      
      if (!access_token) {
        navigate('/login');
        return;
      }
      const id = user?.id;
      
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message={errors?.message} />
        <Alert type="success" message={success?.message} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user} />
          </div>
          
          <div className="lg:col-span-2">
            <ProfileTabs user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
