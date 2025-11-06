import React from 'react';
import Navigation from './Navigation';
import Alert from './Alert';

const EditProfile = ({ user, errors }) => {
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

          <form action={`/users/${user?.id}/profile/edit`} method="POST">
            
            {/* Username */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                name="username" 
                defaultValue={user?.username || ''}
                placeholder="Your username"
                required
                minLength="3"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                defaultValue={user?.email || ''}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                type="submit"
                style={{ backgroundColor: '#FF214F' }}
                className="flex-1 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <i className="fas fa-save mr-2"></i>Save Changes
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
