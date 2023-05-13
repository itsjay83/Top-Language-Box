const syms = "░▏▎▍▌▋▊▉█";

const axios = require('axios');
const calculateLanguageUsage = require('./calculation');

async function updateGist(username, token, gistId) {
    try {
        const { languages, totalBytes } = await calculateLanguageUsage(username, token);
        const maxBarLength = 20 * 8;

        let output = ``;

        // Sort languages by usage in descending order
        const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

        for (const [language, bytes] of sortedLanguages) {
            const ratio = bytes / totalBytes;
            const barLength = Math.round(ratio * maxBarLength);
            const fullBlocks = Math.floor(barLength / 8);
            const remainder = barLength % 8;
            const bar = '█'.repeat(fullBlocks) + syms[remainder] + '░'.repeat(maxBarLength / 8 - fullBlocks - 1);
            output += `${language}: ${bytes} bytes, ${bar} ${(ratio * 100).toFixed(2)}%\n`;
        }

        const gistContent = {
            description: 'My Top-Languages',
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

const username = process.env.USER_NAME;
const token = process.env.GH_TOKEN;
const gistId = process.env.GH_GISTID;

updateGist(username, token, gistId);
