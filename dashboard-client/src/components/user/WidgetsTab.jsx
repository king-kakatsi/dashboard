import React, { useState, useEffect } from 'react';
import { getAllWidgets, activateWidget, deactivateWidget } from '../../controllers/widgetController';
import { fetchFromLocalStorage } from '../../services/localStorageService';

const WidgetsTab = ({ widgets }) => {
  const [allWidgets, setAllWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const user = fetchFromLocalStorage('user');

  useEffect(() => {
    loadAllWidgets();
  }, []);

  const loadAllWidgets = async () => {
    setLoading(true);
    const [success, data] = await getAllWidgets();
    if (success) {
      setAllWidgets(data);
    }
    setLoading(false);
  };

  const isWidgetActive = (widgetId) => {
    if (!user || !user.id) return false;
    const widget = allWidgets.find(w => w._id === widgetId);
    if (!widget) return false;
    return widget.userIds && widget.userIds.includes(user.id);
  };

  const handleToggleWidget = async (widgetId) => {
    if (processingIds.has(widgetId)) return;

    setProcessingIds(prev => new Set(prev).add(widgetId));
    
    const isActive = isWidgetActive(widgetId);
    let result;

    if (isActive) {
      result = await deactivateWidget(widgetId, user.id);
    } else {
      result = await activateWidget(widgetId, user.id);
    }

    if (result[0]) {
      setAllWidgets(prevWidgets => 
        prevWidgets.map(widget => {
          if (widget._id === widgetId) {
            const updatedUserIds = isActive
              ? widget.userIds.filter(id => id !== user.id)
              : [...(widget.userIds || []), user.id];
            return { ...widget, userIds: updatedUserIds };
          }
          return widget;
        })
      );
    }

    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
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

  if (!allWidgets || allWidgets.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-th text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 mb-4">No widgets available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allWidgets.map((widget) => {
        const isActive = isWidgetActive(widget._id);
        const isProcessing = processingIds.has(widget._id);

        return (
          <div 
            key={widget._id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {widget.name || 'Widget'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {widget.type || 'Type'}
                </p>
                {widget.description && (
                  <p className="text-xs text-gray-500 mt-2">
                    {widget.description}
                  </p>
                )}
              </div>
              <i className={`fas ${widget.icon || 'fa-cube'} text-xl`} style={{ color: '#FF214F' }}></i>
            </div>
            <button
              onClick={() => handleToggleWidget(widget._id)}
              disabled={isProcessing}
              className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
        );
      })}
    </div>
  );
};

export default WidgetsTab;