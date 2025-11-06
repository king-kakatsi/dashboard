import React, { useState } from 'react';
import ServicesTab from './ServicesTab';
import WidgetsTab from './WidgetsTab';

const ProfileTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { id: 'services', label: 'My Services', icon: 'fa-cog' },
    { id: 'widgets', label: 'My Widgets', icon: 'fa-th' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServicesTab services={user?.services} />;
      case 'widgets':
        return <WidgetsTab widgets={user?.widgets} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors border-b-2 hover:bg-gray-50 ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : 'border-transparent text-gray-600'
              }`}
              style={activeTab === tab.id ? { borderColor: '#FF214F', color: '#FF214F' } : {}}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileTabs;