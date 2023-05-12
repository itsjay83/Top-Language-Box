const axios = require('axios');
const calculateLanguageUsage = require('./calculation');

async function updateGist(username, token, gistId) {
    try {
        const { languages, totalBytes } = await calculateLanguageUsage(username, token);
        const maxBarLength = 30; // Maximum length of the bar graph
        // let output = `Language usage ratios for GitHub user ${username} are:\n`;
        let output = ``;

        // Sort languages by usage in descending order
        const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

        for (const [language, bytes] of sortedLanguages) {
            const ratio = bytes / totalBytes;
            const barLength = Math.round(ratio * maxBarLength);
            const bar = '█'.repeat(barLength).padEnd(maxBarLength, "░");
            output += `${language.padEnd(11, " ")}: ${bar} ${ratio.toFixed(2)*100}%\n`;
        }

        const gistContent = {
            description: 'My Top-Language',
            public: true,
            files: {
                'language-usage.txt': {
                    content: output
                }
            }
        };

        const auth = { headers: { 'Authorization': `token ${token}` } };
        await axios.patch(`https://api.github.com/gists/${gistId}`, gistContent, auth);

        console.log('Gist updated successfully.');
    } catch (error) {
        console.error('Failed to update Gist:', error);
    }
}

const username = 'Suk0803'; // replace with your GitHub username
const token = process.env.GH_TOKEN;
const gistId = process.env.GH_GISTID;// replace with your Gist ID

updateGist(username, token, gistId);


