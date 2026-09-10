const GITHUB_API = "https://api.github.com";

// Fetch public repositories of a GitHub user
export const getUserRepos = async (username) => {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/repos`);
    if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
};

// Fetch starred repositories of a GitHub user
export const getUserStars = async (username) => {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/starred`);
    if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
};
