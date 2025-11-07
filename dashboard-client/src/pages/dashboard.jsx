import React, { useEffect, useState } from "react";
import { getConnectors, getWidgetsByService } from "../services/apiService";
import { getUserDashboard } from "../controllers/userController";
import { getFromApi } from "../services/axiosService";

import BackImage from "/src/assets/bg.jpg";
import GithubStarsWidget from "../components/githubWidgets/Favori";
import GithubReposWidget from "../components/githubWidgets/Repo";
import SportsNewsWidget from "../components/news/FootNewsWidget";

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);
  const [showGithubModal, setShowGithubModal] = useState(false); // modal GitHub

  useEffect(() => {
    const fetchData = async () => {
      const connectorsData = await getConnectors();
      setConnectors(connectorsData);
    };
    fetchData();
    fetchUserDashboard();
  }, []);

  const fetchUserDashboard = async () => {
    const result = await getUserDashboard();
    if (result && result[1]) setConnectors(result[1].connectors || []);
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
    <div
      className="relative min-h-screen bg-cover bg-center text-gray-100 font-sans overflow-hidden"
      style={{ backgroundImage: `url(${BackImage})` }}
    >
      {/* profile icon */}
      <div className="items-center justify-center m-10">
        <a href="/profile" className="relative hover:scale-110 transition-transform">
          <img
            src="https://freesvg.org/img/abstract-user-flat-4.png"
            alt="profile icon"
            className="w-12 h-12 rounded"
          />
        </a>
      </div>

      {/* Dock en bas */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-40 h-28 p-3">
        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl flex items-end space-x-4">
          {/* Bouton GitHub modale */}
          <button
            onClick={() => setShowGithubModal(true)}
            className="hover:scale-110 transition-transform"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
              alt="GitHub"
              className="w-12 h-12 rounded"
            />
            <p className="text-xs text-white mt-1 text-center">GitHub</p>
          </button>

          {connectors.map((app) => (
            <button
              key={app._id || app.id}
              onClick={() => openApp(app)}
              className="relative hover:scale-110 transition-transform"
            >
              <img src={app.icon} alt={app.title} className="w-12 h-12 rounded" />
              <p className="text-xs text-white mt-1">{app.title}</p>
            </button>
          ))}
        </div>
      </footer>

      {/* Fenêtres ouvertes */}
      {openApps.map((app, index) => (
        <Window
          key={app._id || app.id || index}
          app={app}
          onClose={() => closeApp(app.id)}
          zIndex={50 + index}
        />
      ))}

      {/* Modal GitHub */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-gray-900/90 p-6 rounded-2xl w-[90%] max-w-3xl relative">
            <button
              onClick={() => setShowGithubModal(false)}
              className="absolute top-3 right-4 text-red-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4 text-center text-white">GitHub Widgets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GithubReposWidget />
              <GithubStarsWidget />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fenêtre d’application (dock)
const Window = ({ app, onClose, zIndex }) => {
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
      className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl w-96"
      style={{ zIndex }}
    >
      <div className="flex justify-between items-center bg-gray-800/60 px-3 py-1.5 rounded-t-xl cursor-pointer">
        <span className="font-medium">{app.title}</span>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-500 text-xl leading-none cursor-pointer"
        >
          x
        </button>
      </div>
      <div className="p-4 text-gray-200">
        <p>{app.description || "No description available."}</p>
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Available widgets:</h3>
          {widgets.length > 0 ? (
            <div className="space-y-3">
              {widgets?.map((widget) => (
                <WidgetCard key={widget._id} widget={widget} app={app} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No widgets available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Widget générique
const WidgetCard = ({ widget, app }) => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  if (widget?.name === "Sports News") {
    return <SportsNewsWidget widget={widget} app={app} />;
  }

  const fetchWidgetData = async () => {
    setLoading(true);
    try {
      let res = await getFromApi(`http://localhost:3000/widgets/${widget._id}/fetch`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching widget:", err);
      setData({ error: "Cannot load widget" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={fetchWidgetData}
      className="cursor-pointer bg-gray-800/60 border border-white/10 rounded-lg p-3 hover:bg-gray-700/60 transition"
    >
      <h4 className="font-semibold text-sm mb-2">{widget.name}</h4>
      <img src={widget.icon} alt={widget.name} className="w-12 h-12 rounded" />
      <p className="text-xs text-gray-400 mb-2">{widget.description}</p>
      <div className="text-sm bg-gray-900/40 p-2 rounded">
        {isLoading ? (
          <p className="text-gray-400 italic">Loading...</p>
        ) : data ? (
          data.error ? (
            <p className="text-red-400">{data.error}</p>
          ) : (
            <pre className="whitespace-pre-wrap text-xs">
              {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
            </pre>
          )
        ) : (
          <p className="text-gray-400 italic">Click to load</p>
        )}
      </div>
    </div>
  );
};
