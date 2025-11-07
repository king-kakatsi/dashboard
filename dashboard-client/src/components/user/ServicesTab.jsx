import React from 'react';

const ServicesTab = ({ services }) => {
  console.log("DEBUG - from services tab", services);
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-cog text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 mb-4">No services configured yet</p>
        <a 
          href="/services" 
          style={{ backgroundColor: '#FF214F' }}
          className="inline-block px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Browse Services
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div 
          key={service.id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">
                {service.name || 'Service'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                <i className="fas fa-tag mr-2"></i>
                {service.category || 'Category'}
              </p>
              {service.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {service.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <span 
                className="inline-block bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-semibold"
              >
                active
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesTab;
