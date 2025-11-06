import React from 'react';

const ProfileCard = ({ user }) => {
  const getInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
      {/* Profile Picture */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg" style={{ backgroundColor: '#FF214F' }}>
            {getInitials(user?.username)}
          </div>
          {user?.verified && (
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <i className="fas fa-check text-white text-xs"></i>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          {user?.username || 'User'}
        </h2>
        <p className="text-gray-600 text-sm">
          {user?.email || 'email@example.com'}
        </p>
        
        {user?.role && (
          <span 
            className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold" 
            style={user.role === 'ADMIN' ? { backgroundColor: '#FF214F', color: 'white' } : { backgroundColor: '#e5e7eb', color: '#374151' }}
          >
            {user.role}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold" style={{ color: '#FF214F' }}>
            {user?.services?.length || 0}
          </div>
          <div className="text-xs text-gray-600">Services</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold" style={{ color: '#FF214F' }}>
            {user?.widgets?.length || 0}
          </div>
          <div className="text-xs text-gray-600">Widgets</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold" style={{ color: '#FF214F' }}>
            {user?.dashboards?.length || 0}
          </div>
          <div className="text-xs text-gray-600">Dashboards</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <a 
          href={`/users/${user?.id}/profile/edit`}
          style={{ backgroundColor: '#FF214F' }}
          className="block w-full text-center text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          <i className="fas fa-edit mr-2"></i>Edit Profile
        </a>
        <a 
          href={`/users/${user?.id}/profile/change-password/`}
          className="block w-full text-center bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          <i className="fas fa-key mr-2"></i>Change Password
        </a>
      </div>
    </div>
  );
};

export default ProfileCard;