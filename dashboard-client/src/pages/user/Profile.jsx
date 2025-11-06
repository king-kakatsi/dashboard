import React from 'react';
import Navigation from './Navigation';
import ProfileCard from './ProfileCard';
import ProfileTabs from './ProfileTabs';
import Alert from './Alert';

const Profile = ({ user, errors, success }) => {
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
