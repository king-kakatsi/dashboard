import React, { useEffect, useState } from "react";
import { getConnectors, getWidgetsByService } from "../services/apiService";
import BackImage from '/src/assets/Image.jpeg';
import { Navigate } from "react-router-dom";
import { getUserDashboard } from "../controllers/userController";

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);
  const [hoveredApp, setHoveredApp] = useState(null);

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  const fetchUserDashboard = async () => {
    const result = await getUserDashboard();
    setConnectors(result[1].connectors);
  };

  const openApp = (app) => {
    if (!openApps.find((a) => a.id === app.id)) {
      setOpenApps([...openApps, app]);
    }
  };

  const closeApp = (id) => {
    setOpenApps(openApps.filter((a) => a.id !== id));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-purple-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area for widgets */}
      <div className="relative z-10 pb-40">
        {openApps.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Welcome to your Dashboard</h2>
              <p className="text-purple-300 text-lg max-w-md">
                Click on any connector below to open widgets and start customizing your workspace
              </p>
            </div>
          </div>
        )}

        {/* Opened windows */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openApps.map((app, index) => (
            <Window
              key={app._id || app.id || index}
              app={app}
              onClose={() => closeApp(app.id)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Floating Dock */}
      <footer className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-50 pointer-events-none">
        <div className="pointer-events-auto bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-2xl p-3 rounded-3xl shadow-2xl border border-white/10 shadow-pink-500/20">
          <div className="flex items-end space-x-2 px-2">
            {/* Profile Icon */}
            <a
              href="/profile"
              onMouseEnter={() => setHoveredApp('profile')}
              onMouseLeave={() => setHoveredApp(null)}
              className="group relative flex flex-col items-center justify-center transition-all duration-300 ease-out"
              style={{
                transform: hoveredApp === 'profile' ? 'translateY(-12px) scale(1.15)' : 'translateY(0) scale(1)',
              }}
            >
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 border-2 border-white/20">
                  <span className="text-2xl">👤</span>
                </div>
                {hoveredApp === 'profile' && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap border border-white/10">
                    Profile
                  </div>
                )}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </a>

            <div className="w-px h-12 bg-white/10 mx-1"></div>

            {/* Connectors */}
            {connectors.map((app) => (
              <button
                key={app._id || app.id}
                onClick={() => openApp(app)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group relative flex flex-col items-center justify-center transition-all duration-300 ease-out"
                style={{
                  transform: hoveredApp === app.id ? 'translateY(-12px) scale(1.15)' : 'translateY(0) scale(1)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 border-2 border-white/20 overflow-hidden">
                    {app.icon?.startsWith('http') ? (
                      <img src={app.icon} alt={app.title} className="w-8 h-8 object-cover" />
                    ) : (
                      <span className="text-2xl">{app.icon || '📦'}</span>
                    )}
                  </div>
                  {openApps.find((a) => a.id === app.id) && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50"></div>
                  )}
                  {hoveredApp === app.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap border border-white/10">
                      {app.title}
                    </div>
                  )}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Window component
const Window = ({ app, onClose, index }) => {
  const [widgets, setWidgets] = useState([]);
  
  useEffect(() => {
    const fetchWidgets = async () => {
      const data = await getWidgetsByService(app._id);
      setWidgets(data);
    };
    fetchWidgets();
  }, [app]);

  return (
    <div 
      className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-xl border border-pink-500/20 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
      style={{ 
        animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      <div className="flex justify-between items-center bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-4 py-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            {app.icon?.startsWith('http') ? (
              <img src={app.icon} alt={app.title} className="w-5 h-5 object-cover" />
            ) : (
              <span className="text-lg">{app.icon || '📦'}</span>
            )}
          </div>
          <span className="font-semibold text-white text-lg">{app.title}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white transition-all duration-200 flex items-center justify-center group border border-pink-500/30"
        >
          <span className="text-lg leading-none group-hover:rotate-90 transition-transform duration-200">×</span>
        </button>
      </div>
      
      <div className="p-5 text-gray-100">
        <p className="text-sm text-purple-200 mb-4">{app.description || "No description available for this connector."}</p>
        
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-3 text-pink-300 uppercase tracking-wide flex items-center">
            <span className="w-1 h-4 bg-pink-500 rounded mr-2"></span>
            Available Widgets
          </h3>
          {widgets.length > 0 ? (
            <div className="space-y-3">
              {widgets?.map((widget) => (
                <WidgetCard key={widget._id} widget={widget} app={app}/>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-purple-300 italic">No widgets available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WidgetCard = ({ widget, app }) => {
  const [data, setData] = useState(null);
  
  const fetchWidgetData = async () => {
    const fullUrl = `${app.baseUrl}${widget.endpoint}`;
    console.log(fullUrl);
    try {
      const res = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error while fetching widget:", widget.name, err);
      setData({ error: "Cannot load widget" });
    }
  };

  useEffect(() => {
    fetchWidgetData();
    const interval = setInterval(fetchWidgetData, widget.refreshRate * 1000);
    return () => clearInterval(interval);
  }, [widget, app]);

  return (
    <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-purple-500/20 rounded-xl p-4 hover:border-pink-500/40 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
            {widget.icon?.startsWith('http') ? (
              <img src={widget.icon} alt={widget.name} className="w-6 h-6 object-cover rounded" />
            ) : (
              <span className="text-lg">{widget.icon || '⚙️'}</span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">{widget.name}</h4>
            <p className="text-xs text-purple-300">{widget.description}</p>
          </div>
        </div>
      </div>

      <div className="text-sm bg-black/30 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
        {data ? (
          data.error ? (
            <div className="flex items-center space-x-2 text-pink-400">
              <p>{data.error}</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-xs text-purple-100 font-mono overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )
        ) : (
          <div className="flex items-center space-x-2 text-purple-300">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="italic">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}