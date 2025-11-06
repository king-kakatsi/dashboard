import React from 'react';

const WidgetsTab = ({ widgets }) => {
  if (!widgets || widgets.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-th text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 mb-4">No widgets added yet</p>
        <a 
          href="/widgets" 
          style={{ backgroundColor: '#FF214F' }}
          className="inline-block px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Add Widgets
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {widgets.map((widget) => (
        <div 
          key={widget.id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              {widget.name || 'Widget'}
            </h3>
            <i className={`fas ${widget.icon || 'fa-cube'} text-xl`} style={{ color: '#FF214F' }}></i>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {widget.type || 'Type'}
          </p>
          {widget.description && (
            <p className="text-xs text-gray-500 mt-2">
              {widget.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default WidgetsTab;
