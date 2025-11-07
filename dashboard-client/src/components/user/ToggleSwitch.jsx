import React from 'react';

const ToggleSwitch = ({ isActive, onToggle, loading }) => {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isActive ? 'bg-[#10b981]' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;