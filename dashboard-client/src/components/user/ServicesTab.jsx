import React, { useState, useEffect } from 'react';
import { getAllConnectors, activateConnector, deactivateConnector } from '../../controllers/connectorController';
import { fetchFromLocalStorage } from '../../services/localStorageService';

const ServicesTab = ({ services }) => {
  const [allConnectors, setAllConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const user = fetchFromLocalStorage('user');

  useEffect(() => {
    loadAllConnectors();
  }, []);

  const loadAllConnectors = async () => {
    setLoading(true);
    const [success, data] = await getAllConnectors();
    if (success) {
      setAllConnectors(data);
    }
    setLoading(false);
  };

  const isConnectorActive = (connectorId) => {
    if (!user || !user.id) return false;
    const connector = allConnectors.find(c => c._id === connectorId);
    if (!connector) return false;
    return connector.userIds && connector.userIds.includes(user.id);
  };

  const handleToggleConnector = async (connectorId) => {
    if (processingIds.has(connectorId)) return;

    setProcessingIds(prev => new Set(prev).add(connectorId));
    
    const isActive = isConnectorActive(connectorId);
    let result;

    if (isActive) {
      result = await deactivateConnector(connectorId, user.id);
    } else {
      result = await activateConnector(connectorId, user.id);
    }

    if (result[0]) {
      setAllConnectors(prevConnectors => 
        prevConnectors.map(conn => {
          if (conn._id === connectorId) {
            const updatedUserIds = isActive
              ? conn.userIds.filter(id => id !== user.id)
              : [...(conn.userIds || []), user.id];
            return { ...conn, userIds: updatedUserIds };
          }
          return conn;
        })
      );
    }

    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectorId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      </div>
    );
  }

  if (!allConnectors || allConnectors.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-cog text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 mb-4">No services available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allConnectors.map((connector) => {
        const isActive = isConnectorActive(connector._id);
        const isProcessing = processingIds.has(connector._id);

        return (
          <div 
            key={connector._id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {connector.name || 'Service'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <i className="fas fa-tag mr-2"></i>
                  {connector.category || 'Category'}
                </p>
                {connector.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {connector.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <button
                  onClick={() => handleToggleConnector(connector._id)}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    isActive ? 'Deactivate' : 'Activate'
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServicesTab;