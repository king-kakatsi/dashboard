import React, { useEffect, useState } from "react";
import { getUserStars } from "../../controllers/githubController.js";

const GithubStarsWidget = ({ refreshRate = 90 }) => {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(""); 
  const [inputValue, setInputValue] = useState("");
  const [submittedUsernames, setSubmittedUsernames] = useState([]);

  const loadStars = async (user) => {
    if (!user) return;
    setLoading(true);
    const data = await getUserStars(user);
    setStars(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!username) return;

    loadStars(username);
    const interval = setInterval(() => loadStars(username), refreshRate * 1000);
    return () => clearInterval(interval);
  }, [username, refreshRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setUsername(trimmed);
    setSubmittedUsernames((prev) => [trimmed, ...prev.filter(u => u !== trimmed)]);
    setInputValue("");
  };

  return (
    <div className="bg-black/60 p-4 rounded-lg text-white w-80">
      <h3 className="text-lg font-semibold mb-2">Favoris GitHub</h3>

      {/* Input toujours visible */}
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          type="text"
          placeholder="Entrez votre GitHub username"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 rounded text-white"
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Valider
        </button>
      </form>

      {/* Historique des usernames soumis */}
      {submittedUsernames.length > 0 && (
        <div className="mb-3 text-sm text-green-400">
          {submittedUsernames.map((user, idx) => (
            <p key={idx}>
              Username pris en compte : <strong>{username}</strong>
            </p>
          ))}
        </div>
      )}

      {/* Affichage des repos favoris pour le username courant */}
      {username && (
        <>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <ul className="space-y-2">
              {stars.slice(0, 5).map((repo) => (
                <li key={repo.id}>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {repo.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default GithubStarsWidget;
