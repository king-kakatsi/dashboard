import { useEffect, useState } from "react";
import { getWidgetsByService } from "../../services/apiService";

//window component
const DashboardWindow = ({ app, onClose, zIndex }) => {

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
