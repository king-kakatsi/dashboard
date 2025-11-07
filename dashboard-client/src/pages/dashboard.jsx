import React, { useEffect, useState } from "react";
import { getConnectors, getWidgetsByService } from "../services/apiService";
// import BackImage from "/src/assets/Image.jpeg";
import BackImage from '/src/assets/Image.jpeg';
import { Navigate } from "react-router-dom";
import { getUserDashboard } from "../controllers/userController";

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);

  // fetch connectorsfrom api
  useEffect(() => {
    const fetchData = async () => {
      const connectorsData = await getConnectors();
      // console.log(data);
      setConnectors(connectorsData);
    };
    fetchData();
    fetchUserDashboard();
  }, []);


  const fetchUserDashboard = async () =>{
    const result = await getUserDashboard();
    setConnectors(result[1].connectors);
  }


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
          <a
              href="/profile"
              className="relative hover:scale-110 transition-transform"
            >
              <img
                src="https://freesvg.org/img/abstract-user-flat-4.png"
                alt="profile icon"
                className="w-12 h-12 rounded"
              />
              <p className="text-xs text-white mt-1">profile</p>
            </a>

          {connectors.map((app) => (
            <button
              key={app._id || app.id}
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
          key={app._id || app.id || index}
          app={app}
          onClose={() => closeApp(app.id)}
          zIndex={50 + index}
        />
      ))}
    </div>
  );
}

//window component
const Window = ({ app, onClose, zIndex }) => {

  //fetch widgets from api
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
        <p>{app.description || "No descripton availble for this connector."}</p>
        {/* Widgets*/}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Available widgets:</h3>
          {widgets.length > 0 ? (
            <div className="space-y-3">
              {widgets?.map((widget) => (
                <WidgetCard key={widget._id} widget={widget} app={app}/>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No widgets availble.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const WidgetCard = ({ widget, app }) => {
  const [data, setData] = useState(null);
  // function to get widget data
  const fetchWidgetData = async () => {
    // console.log(app.baseUrl + widget.endpoint);
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

  // auto-refresh
  useEffect(() => {
    fetchWidgetData();
    const interval = setInterval(fetchWidgetData, widget.refreshRate * 1000);
    return () => clearInterval(interval);
  }, [widget, app]);

  return (
    <div className="bg-gray-800/60 border border-white/10 rounded-lg p-3">
      <h4 className="font-semibold text-sm mb-2">{widget.name}</h4>
      <img
        src={widget.icon}
        alt={widget.name}
        className="w-12 h-12 rounded"
      />
      <p className="text-xs text-gray-400 mb-2">{widget.description}</p>

      {/* display content */}
      <div className="text-sm bg-gray-900/40 p-2 rounded">
        {data ? (
          data.error ? (
            <p className="text-red-400">{data.error}</p>
          ) : (
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          )
        ) : (
          <p className="text-gray-400 italic">Loading...</p>
        )}
      </div>
    </div>
  );
};
