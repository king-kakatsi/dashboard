import React, { useEffect, useState } from "react";
import { getUserRepos } from "../../controllers/githubController";

const GithubReposWidget = ({ refreshRate = 60 }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(""); // username actuel
  const [inputValue, setInputValue] = useState(""); // valeur de l'input

  // fonction pour charger les repos
  const loadRepos = async (user) => {
    if (!user) return;
    setLoading(true);
    const data = await getUserRepos(user);
    setRepos(data);
    setLoading(false);
  };

  // rafraîchissement automatique lorsque username change
  useEffect(() => {
    if (!username) return;

    loadRepos(username);
    const interval = setInterval(() => loadRepos(username), refreshRate * 6000);
    return () => clearInterval(interval);
  }, [username, refreshRate]);

  // handle submit du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setUsername(trimmed); // met à jour le username et déclenche le load
    setInputValue(""); // vide l'input pour nouvelle recherche
  };

  return (
    <div className="bg-black/60 p-4 rounded-lg text-white w-80">
      <h3 className="text-lg font-semibold mb-2">GitHub Repos</h3>

      {/* Input toujours visible pour nouvelles recherches */}
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          type="text"
          placeholder="Entrez un GitHub username"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 rounded text-white bg-black/30 border border-white/20"
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Valider
        </button>
      </form>

      {/* Affichage du username sélectionné */}
      {username && (
        <p className="mb-2 text-sm text-green-400">
          Username pris en compte : <strong>{username}</strong>
        </p>
      )}

      {/* Affichage des repos */}
      {username && (
        <>
          {loading ? (
            <p>Chargement...</p>
          ) : repos.length === 0 ? (
            <p>Aucun dépôt trouvé.</p>
          ) : (
            <ul className="space-y-2">
              {repos.slice(0, 5).map((repo) => (
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

export default GithubReposWidget;
