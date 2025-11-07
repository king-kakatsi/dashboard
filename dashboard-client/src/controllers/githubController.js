const GITHUB_API = "https://api.github.com";

// Récupère les repos d'un utilisateur
export const getUserRepos = async (username) => {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/repos`);
    if (!res.ok) throw new Error(`Erreur GitHub: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getUserRepos:", err);
    return [];
  }
};

// Récupère les repos favoris (starred) d'un utilisateur
export const getUserStars = async (username) => {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/starred`);
    if (!res.ok) throw new Error(`Erreur GitHub: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getUserStars:", err);
    return [];
  }
};
