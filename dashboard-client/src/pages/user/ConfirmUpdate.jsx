
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmUserUpdate } from '../../controllers/userController';
import Alert from '../../components/Alert';

const ConfirmUpdate = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUpdate = async () => {
      if (!userId) {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      const [isSuccess, data] = await confirmUserUpdate(userId);

      if (isSuccess) {
        setStatus('success');
        setMessage(data?.message || 'Your account has been updated successfully!');
        
        setTimeout(() => {
          navigate('/edit-profile', {
            state: { success: { message: 'Profile updated successfully!' } }
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data?.message || 'Failed to confirm update.');
      }
    };

    confirmUpdate();
  }, [userId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <i className="fas fa-spinner fa-spin text-6xl text-indigo-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirming Update...
            </h1>
            <p className="text-gray-600">
              Please wait while we process your request.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <i className="fas fa-check-circle text-6xl text-green-500"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Update Confirmed!
            </h1>
            <Alert type="success" message={message} />
            <p className="text-gray-600 mt-4">
              Redirecting you to your profile...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <i className="fas fa-times-circle text-6xl text-red-500"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmation Failed
            </h1>
            <Alert type="error" message={message} />
            <button
              onClick={() => navigate('/edit-profile')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Profile
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ConfirmUpdate;