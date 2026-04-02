const syms = "░▏▎▍▌▋▊▉█";

const axios = require("axios");
const calculateLanguageUsage = require("./calculation");

function formatBytes(bytes) {
  const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let power = Math.floor(Math.log(bytes) / Math.log(1000));
  power = Math.min(power, units.length - 1);
  bytes /= Math.pow(1000, power);
  return `${bytes.toFixed(2)} ${units[power]}`;
}

async function updateGist(username, token, gistId) {
  try {
    const { languages, totalBytes } = await calculateLanguageUsage(
      username,
      token
    );
    const totalSlots = 20;
    const maxBarLength = totalSlots * 8;

    let output = ``;

    const sortedLanguages = Object.entries(languages).sort(
      (a, b) => b[1] - a[1]
    );

    // Find the length of the longest language name
    const maxLanguageNameLength = sortedLanguages.reduce(
      (max, [language]) => Math.max(max, language.length),
      0
    );
    // Find the length of the longest byte string
    const maxByteLength = sortedLanguages.reduce(
      (max, [_, bytes]) => Math.max(max, formatBytes(bytes).length),
      0
    );

    for (const [language, bytes] of sortedLanguages) {
      const formattedBytes = formatBytes(bytes);
      const paddedLanguage = language.padEnd(maxLanguageNameLength + 1, " ");
      const paddedBytes = formattedBytes.padStart(maxByteLength, " ");
      const ratio = bytes / totalBytes;
      const barLength = Math.round(ratio * maxBarLength);
      const fullBlocks = Math.floor(barLength / 8);
      const remainder = barLength % 8;

      let bar;
      if (fullBlocks >= totalSlots) {
        bar = "█".repeat(totalSlots);
      } else {
        bar =
          "█".repeat(fullBlocks) +
          syms[remainder] +
          "░".repeat(totalSlots - fullBlocks - 1);
      }

      const percent = (ratio * 100).toFixed(2);
      output += `${paddedLanguage}${paddedBytes}: ${bar} ${percent.padStart(
        5,
        " "
      )}%\n`;
    }

    const gistContent = {
      description: "My Top-Languages",
      public: true,
      files: {
        "top-language-usage.txt": {
          content: output,
        },
      },
    };

    const auth = {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Top-Language-Box",
        Accept: "application/vnd.github+json",
      },
    };
    await axios.patch(
      `https://api.github.com/gists/${gistId}`,
      gistContent,
      auth
    );

    console.log("Gist updated successfully.");
  } catch (error) {
    console.error(
      "Failed to update Gist:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

const username = process.env.USER_NAME;
const token = process.env.GH_TOKEN;
const gistId = process.env.GH_GISTID;

// Validate environment variables
if (!username) {
  console.error("Error: USER_NAME environment variable is not set.");
  console.error(
    "Please set your GitHub username: export USER_NAME=your-github-username"
  );
  process.exit(1);
}

if (!token) {
  console.error("Error: GH_TOKEN environment variable is not set.");
  console.error(
    "Please set your GitHub token: export GH_TOKEN=your-github-token"
  );
  process.exit(1);
}

if (!gistId) {
  console.error("Error: GH_GISTID environment variable is not set.");
  console.error("Please set your Gist ID: export GH_GISTID=your-gist-id");
  process.exit(1);
}

console.log(`Starting update for user: ${username}`);
updateGist(username, token, gistId);
