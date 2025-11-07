import React, { useEffect, useState } from "react";
import { getConnectors, getWidgetsByService } from "../services/apiService";
import BackImage from "/src/assets/bg.jpg";
import { getUserDashboard } from "../controllers/userController";
import { getFromApi } from "../services/axiosService";
import SportsNewsWidget from "../components/news/FootNewsWidget";

export default function Dashboard() {
  const [connectors, setConnectors] = useState([]);
  const [openApps, setOpenApps] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [success, connectorsData] = await getConnectors();
      console.log("DEBUG", success, connectorsData);
      if (success && Array.isArray(connectorsData)) {
        setConnectors(connectorsData);
      } else {
        setConnectors([]);
      }
    };
    fetchData();
  }, []);

  const openApp = (app) => {
    if (!openApps.find((a) => a._id === app._id)) {
      setOpenApps([...openApps, app]);
    }
  };

  const closeApp = (id) => {
    setOpenApps(openApps.filter((a) => a._id !== id));
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-gray-100 font-sans overflow-hidden"
      style={{ backgroundImage: `url(${BackImage})` }}
    >
      <div className="items-center justify-center m-10 ">
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

      <footer className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-40 h-28 p-3">
        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl flex items-end space-x-3">
          {connectors.map((app) => (
            <button
              key={app._id}
              onClick={() => openApp(app)}
              className="relative hover:scale-110 transition-transform"
            >
              <img
                src={app.icon}
                alt={app.name}
                className="w-12 h-12 rounded"
              />
              <p className="text-xs text-white mt-1">{app.name}</p>
            </button>
          ))}
        </div>
      </footer>

      {openApps.map((app, index) => (
        <Window
          key={app._id}
          app={app}
          onClose={() => closeApp(app._id)}
          zIndex={50 + index}
        />
      ))}
    </div>
  );
}

const Window = ({ app, onClose, zIndex }) => {
  const [widgets, setWidgets] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  // const [news, setNews] = useState();

  useEffect(() => {
    const fetchWidgets = async () => {
      const [success, data] = await getWidgetsByService(app._id);
      if (success && Array.isArray(data)) {
        setWidgets(data);
      } else {
        setWidgets([]);
      }
    };
    fetchWidgets();
  }, [app]);

  return (
    <div
      className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl w-96"
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
      <div className="p-4 text-gray-200">
        <p>{app.description || "No description available for this connector."}</p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Available widgets:</h3>
          {widgets.length > 0 ? (
            <div className="space-y-3">
              {widgets.map((widget) => (
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

const WidgetCard = ({ widget }) => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  const fetchWidgetData = async () => {
    setLoading(true);
    try {
      const [success, response] = await getFromApi(
        `widgets/${widget._id}/fetch`
      );
      console.log("Widget response:", success, response);
      
      if (success && response.data) {
        if (response.data.weather || response.data.main) {
          setWeather(response.data);
        } else {
          setData(response.data);
        }
      } else {
        setData({ error: "Failed to load data" });
      }
    } catch (err) {
      console.error("Error while fetching widget:", widget.name, err);
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
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{widget.name}</h4>
        <img src={widget.icon} alt={widget.name} className="w-8 h-8 rounded" />
      </div>
      <p className="text-xs text-gray-400 mb-2">{widget.description}</p>

      {isLoading ? (
        <div className="text-sm bg-gray-900/40 p-2 rounded">
          <p className="text-gray-400 italic">Loading...</p>
        </div>
      ) : weather ? (
        <WeatherCard weather={weather} />
      ) : data ? (
        <div className="text-sm bg-gray-900/40 p-2 rounded">
          {data.error ? (
            <p className="text-red-400">{data.error}</p>
          ) : (
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-48">
              {typeof data === "string"
                ? data
                : JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <div className="text-sm bg-gray-900/40 p-2 rounded">
          <p className="text-gray-400 italic">Click to display</p>
        </div>
      )}
    </div>
  );
};

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  const condition = weather.weather?.[0]; 
  const main = weather.main || {};
  const wind = weather.wind || {};

  return (
    <div className="bg-gradient-to-br from-blue-500/30 to-indigo-700/30 rounded-xl p-4 text-white shadow-lg backdrop-blur-md mt-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Local Weather</h2>
          <p className="capitalize text-gray-200 text-sm">
            {condition?.description || "No description"}
          </p>
        </div>
        {condition?.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
            alt={condition.main}
            className="w-14 h-14"
          />
        )}
      </div>

      <div className="mt-3 flex justify-around">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">
            {main.temp ? Math.round(main.temp) : "--"}°C
          </span>
          <span className="text-xs text-gray-300">Temperature</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{main.humidity ?? "--"}%</span>
          <span className="text-xs text-gray-300">Humidity</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">
            {wind.speed ? Math.round(wind.speed) : "--"} m/s
          </span>
          <span className="text-xs text-gray-300">Wind</span>
        </div>
      </div>
    </div>
  );
};