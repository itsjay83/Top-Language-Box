const axios = require("axios");

async function calculateLanguageUsage(username, token) {
  try {
    const auth = {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Top-Language-Box",
        Accept: "application/vnd.github+json",
      },
    };

    let allRepos = [];
    let page = 1;
    while (true) {
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
        auth
      );
      allRepos = allRepos.concat(response.data);
      if (response.data.length < 100) break;
      page++;
    }

    const languages = {};
    let totalBytes = 0;

    for (const repo of allRepos) {
      const lang = await axios.get(repo.languages_url, auth);
      for (const language in lang.data) {
        if (languages[language]) {
          languages[language] += lang.data[language];
        } else {
          languages[language] = lang.data[language];
        }
        totalBytes += lang.data[language];
      }
    }

    return { languages, totalBytes };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Failed to calculate language usage: ${errorMessage}`);
  }
}

module.exports = calculateLanguageUsage;
