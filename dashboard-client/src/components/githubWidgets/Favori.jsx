import React, { useState } from "react";
import { getUserStars } from "../../controllers/githubController";

export default function Favoris() {
  const [username, setUsername] = useState("");
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStars = async () => {
    setLoading(true);
    const data = await getUserStars(username);
    setStars(data);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md w-96">
      <h2 className="text-lg font-bold mb-2">GitHub Starred Repos</h2>
      <input
        type="text"
        placeholder="Nom d'utilisateur GitHub"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 rounded mb-2 text-black"
      />
      <button
        onClick={fetchStars}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-4"
      >
        Rechercher
      </button>

      {loading && <p>Chargement...</p>}

      {stars.length > 0 && (
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {stars.map((repo) => (
            <li key={repo.id} className="border-b border-gray-600 py-1">
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.full_name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
