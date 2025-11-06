import React from 'react';

const Alert = ({ type, message }) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-500/90',
      border: 'border-red-400',
      icon: 'fa-exclamation-circle'
    },
    success: {
      bg: 'bg-green-500/90',
      border: 'border-green-400',
      icon: 'fa-check-circle'
    }
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`mb-6 p-4 ${style.bg} backdrop-blur-sm border ${style.border} rounded-xl flex items-start gap-3`}>
      <i className={`fas ${style.icon} text-white mt-0.5`}></i>
      <p className="text-sm text-white">{message}</p>
    </div>
  );
};

export default Alert;
