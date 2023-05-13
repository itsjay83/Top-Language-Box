const syms = "░▏▎▍▌▋▊▉█";

const axios = require('axios');
const calculateLanguageUsage = require('./calculation');

function formatBytes(bytes) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let power = Math.floor(Math.log(bytes) / Math.log(1000));
    power = Math.min(power, units.length - 1);
    bytes /= Math.pow(1000, power);
    return `${bytes.toFixed(2)} ${units[power]}`;
}

async function updateGist(username, token, gistId) {
    try {
        const { languages, totalBytes } = await calculateLanguageUsage(username, token);
        const maxBarLength = 20 * 8;

        let output = ``;

        const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

        // Find the length of the longest language name
        const maxLanguageNameLength = sortedLanguages.reduce((max, [language]) => Math.max(max, language.length), 0);
        // Find the length of the longest byte string
        const maxByteLength = sortedLanguages.reduce((max, [_, bytes]) => Math.max(max, formatBytes(bytes).length), 0);

        for (const [language, bytes] of sortedLanguages) {
            const formattedBytes = formatBytes(bytes);
            const paddedLanguage = language.padEnd(maxLanguageNameLength + 2, " ");
            const paddedBytes = formattedBytes.padStart(maxByteLength + 2, " ");
            const ratio = bytes / totalBytes;
            const barLength = Math.round(ratio * maxBarLength);
            const fullBlocks = Math.floor(barLength / 8);
            const remainder = barLength % 8;
            const bar = '█'.repeat(fullBlocks) + syms[remainder] + '░'.repeat(maxBarLength / 8 - fullBlocks - 1);
            output += `${paddedLanguage}${paddedBytes}: ${bar} ${(ratio * 100).toFixed(2).padStart(4, " ")}%\n`;
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
