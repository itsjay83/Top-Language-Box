const axios = require('axios');

async function calculateLanguageUsage(username, token) {
    try {
        const auth = { headers: { 'Authorization': `token ${token}` } };

        const repos = await axios.get(`https://api.github.com/users/${username}/repos`, auth);

        const languages = {};
        let totalBytes = 0;

        for (const repo of repos.data) {
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
        throw new Error(`Failed to calculate language usage: ${error.message}`);
    }
}

module.exports = calculateLanguageUsage;

