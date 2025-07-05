const fs = require('fs');
const path = require('path');

const cacheFile = path.join(__dirname, 'repliedMessages.json');

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

function hasReplied(channel, ts) {
  const cache = loadCache();
  return !!cache[`${channel}-${ts}`];
}

function markReplied(channel, ts) {
  const cache = loadCache();
  cache[`${channel}-${ts}`] = true;
  saveCache(cache);
}

module.exports = { hasReplied, markReplied };
