import { useEffect, useState } from "react";
import { getAllConnectors } from "../controllers/connectorController";
import { getUserDashboard } from "../controllers/userController";

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getUserDashboard();
        
        if (result && result[1] && Array.isArray(result[1].connectors)) {
          setConnectors(result[1].connectors);
        } else {
          const connectorsData = await getAllConnectors();
          if (Array.isArray(connectorsData)) {
            setConnectors(connectorsData);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err.message);
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
          return;
        }
        
        try {
          const connectorsData = await getAllConnectors();
          if (Array.isArray(connectorsData)) {
            setConnectors(connectorsData);
          }
        } catch (fallbackErr) {
          console.error("Fallback failed:", fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function pour obtenir l'ID
  const getAppId = (app) => app._id || app.id;

  // Open a window
  const openApp = (app) => {
    const appId = getAppId(app);
    if (!openApps.find((a) => getAppId(a) === appId)) {
      setOpenApps([...openApps, app]);
    }
  };

  // Close a window
  const closeApp = (id) => {
    setOpenApps(openApps.filter((a) => getAppId(a) !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error && connectors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 px-4 py-2 rounded text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-gray-100 font-sans overflow-hidden"
      style={{
        backgroundImage: `url(${"ss"})`,
      }}
    >
      {/* Profile icon */}
      <div className="items-center justify-center m-10">
        <a
          href="/profile"
          className="relative hover:scale-110 transition-transform"
        >
          <img
            src="https://freesvg.org/img/abstract-user-flat-4.png"
            alt="profile icon"
            className="w-12 h-12 rounded"
          />
        </a>
      </div>

      {/* Connectors Dock */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-40 h-28 p-3">
        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl flex items-end space-x-3">
          {Array.isArray(connectors) && connectors.length > 0 ? (
            connectors.map((app) => (
              <button
                key={getAppId(app)}
                onClick={() => openApp(app)}
                className="relative hover:scale-110 transition-transform"
              >
                <img
                  src={app.icon}
                  alt={app.title}
                  className="w-12 h-12 rounded"
                />
                <p className="text-xs text-white mt-1">{app.title}</p>
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No connectors available</p>
          )}
        </div>
      </footer>

      {/* Opened windows */}
      {openApps.map((app, index) => (
        <Window
          key={getAppId(app)}
          app={app}
          onClose={() => closeApp(getAppId(app))}
          zIndex={50 + index}
        />
      ))}
    </div>
  );
}