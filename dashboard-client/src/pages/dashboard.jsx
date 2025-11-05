import React, { useEffect, useState } from "react";
import { getConnectors } from "../services/apiService";
// import BackImage from "/src/assets/Image.jpeg";
import BackImage from '/src/assets/Image.jpeg';

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);

  // fetch connectors from api
  useEffect(() => {
    const fetchConnectors = async () => {
      const data = await getConnectors();
      // console.log(data);
      setConnectors(data);
    };
    fetchConnectors();
  }, []);

  // Open a window
  const openApp = (app) => {
    if (!openApps.find((a) => a.id === app.id)) {
      setOpenApps([...openApps, app]);
    }
  };

  // close a window
  const closeApp = (id) => {
    setOpenApps(openApps.filter((a) => a.id !== id));
  };

  return (
    <div
      className="relative min-h-screen bg-contain bg-center text-gray-100 font-sans"
      style={{
        backgroundImage: `url(${BackImage})`,
      }}
    >
      {/* style={{
  backgroundImage: "url('https://4kwallpapers.com/images/walls/thumbs_3t/1432.jpg')",
}} */}

      {/* connectors Dock */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-40 h-28 p-3">
        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl flex items-end space-x-3">
          {connectors.map((app) => (
            <button
              key={app.id}
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
          ))}
        </div>
      </footer>

      {/* opened windows */}
      {openApps.map((app, index) => (
        <Window
          key={app.id}
          app={app}
          onClose={() => closeApp(app.id)}
          zIndex={50 + index}
        />
      ))}
    </div>
  );
}

const Window = ({ app, onClose, zIndex }) => {
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
        <p>{app.description || "No descripton availble for this connector."}</p>
      </div>
    </div>
  );
};
