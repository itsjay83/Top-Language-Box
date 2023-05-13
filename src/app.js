const syms = "░▏▎▍▌▋▊▉█";

const axios = require('axios');
const calculateLanguageUsage = require('./calculation');

async function updateGist(username, token, gistId) {
    try {
        const { languages, totalBytes } = await calculateLanguageUsage(username, token);
        const maxBarLength = 30 * 8; // Now each bar can be split into 8 (due to syms)

        let output = ``;

        // Sort languages by usage in descending order
        const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

        for (const [language, bytes] of sortedLanguages) {
            const ratio = bytes / totalBytes;
            const barLength = Math.round(ratio * maxBarLength);
            const fullBlocks = Math.floor(barLength / 8);
            const remainder = barLength % 8;
            const bar = '█'.repeat(fullBlocks) + syms[remainder] + '░'.repeat(maxBarLength / 8 - fullBlocks - 1);
            output += `${language.padEnd(11, " ")}: ${bar} ${ratio.toFixed(2)*100}%\n`;
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
