import React, { useState } from "react";
import Footer from "../components/footer";
// === Services Lists ===
const dockApps = [
  {
    id: "safari",
    name: "Safari",
    icon: "https://icons.iconarchive.com/icons/wineass/ios7-redesign/256/Safari-icon.png",
    content: <p>My Widgets</p>,
  },
  {
    id: "notes",
    name: "Notes",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Notes_icon.svg/2048px-Apple_Notes_icon.svg.png",
    content: <p>My Widget's</p>,
  },
  {
    id: "photos",
    name: "Photos",
    icon: "https://static.wikia.nocookie.net/logopedia/images/8/83/Apple_Photos_2025_III.png",
    content: <p>My picture's</p>,
  },
];

export default function Dashboard() {
  const [openApps, setOpenApps] = useState([]);

  // Ouvrir une fenêtre
  const openApp = (app) => {
    if (!openApps.find((a) => a.id === app.id)) {
      setOpenApps([...openApps, app]);
    }
  };

  // Fermer une fenêtre
  const closeApp = (id) => {
    setOpenApps(openApps.filter((a) => a.id !== id));
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-gray-100 font-sans"
      style={{
        backgroundImage:
          "url('https://4kwallpapers.com/images/walls/thumbs_3t/1432.jpg')",
      }}
    >
      {/* Dock */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-40 h-28 p-3">
        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl flex items-end space-x-3 cursor-pointer">
          {dockApps.map((app) => (
            <button
              key={app.id}
              onClick={() => openApp(app)}
              className="relative hover:scale-110 transition-transform cursor-pointer"
            >
              <img
                src={app.icon}
                alt={app.name}
                className="w-12 h-12 rounded"
              />
            </button>
          ))}
        </div>
      </footer>

      {/* Fenêtres ouvertes */}
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
      className="absolute top-20 left-1/2 -translate-x-1/2 cursor-pointer bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl w-96"
      style={{ zIndex }}
    >
      <div className="flex justify-between items-center bg-gray-800/60 px-3 py-1.5 rounded-t-xl cursor-pointer">
        <span className="font-medium">{app.name}</span>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-500 text-xl leading-none cursor-pointer"
        >
          x
        </button>
      </div>
      <div className="p-4 text-gray-200">{app.content}</div>
    </div>
  );
};
