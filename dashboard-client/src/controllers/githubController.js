const GITHUB_API = "https://api.github.com";

// Fetch public repositories of a GitHub user
export const getUserRepos = async (username) => {
  try {
    const response = await fetch(`${GITHUB_API}/users/${username}/repos`);
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
    return await response.json();
  } catch {
    return [];
  }
};

// Fetch starred repositories of a GitHub user
export const getUserStars = async (username) => {
  try {
    const response = await fetch(`${GITHUB_API}/users/${username}/starred`);
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
    return await response.json();
  } catch {
    return [];
  }
};
