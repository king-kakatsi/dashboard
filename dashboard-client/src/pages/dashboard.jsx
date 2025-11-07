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

const Window = ({ app, onClose, zIndex }) => {
  const [widgets, setWidgets] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWidgets = async () => {
      const data = await getWidgetsByService(app._id);
      setWidgets(data);
    };
    fetchWidgets();
  }, [app]);

  // Récupère la météo automatiquement
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let res = await getFromApi(
          `http://localhost:3000/widgets/${widgets._id}/fetch`
        );
        if (res[0] === true) {
          setWeatherData(res[1].weather);
        }
      } catch (err) {
        console.error("Erreur météo :", err);
      }
    };
    fetchWeather();
  }, []);

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
        <p>{app.description || "No description available for this connector."}</p>

        {/* Widgets */}
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

        {/* Météo affichée */}
        {weatherData && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Weather</h3>
            <WeatherCard weather={weatherData} />
          </div>
        )}
      </div>
    </div>
  );
};

// Widget générique
const WidgetCard = ({ widget }) => {
  const [data, setData] = useState(null);

  if (widget?.name === "Sports News") {
    return <SportsNewsWidget widget={widget} app={app} />;
  }

  const [isLoading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  const fetchWidgetData = async () => {
    setLoading(true);
    try {
      let res = await getFromApi(
        `http://localhost:3000/widgets/${widget._id}/fetch`
      );
      console.log(res);
      if (res[0] === true && res[1].data) {
       setWeather(res[1].data);
       console.log(res.data.c)

      } else {
        setData(res);
      }
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
            <pre className="whitespace-pre-wrap text-xs">
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
    <div className="bg-gradient-to-br from-white-500/30 to-indigo-700/30 rounded-xl p-4 text-white shadow-lg backdrop-blur-md mt-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Météo locale</h2>
          <p className="capitalize text-gray-200 text-sm">
            {condition?.description || "Aucune description"}
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
          <span className="text-xs text-gray-300">Température</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{main.humidity ?? "--"}%</span>
          <span className="text-xs text-gray-300">Humidité</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">
            {wind.speed ? Math.round(wind.speed) : "--"} m/s
          </span>
          <span className="text-xs text-gray-300">Vent</span>
        </div>
      </div>
    </div>
  );
};