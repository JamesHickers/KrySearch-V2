// PrivacyFilters.js — uBlock Origin + AdGuard filters for KrySearch

const UBO_ASSETS_BASE = 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/';
const ADGUARD_BASE = 'https://filters.adtidy.org/extension/chromium/filters/';

// Lists to load
const FILTER_LISTS = [
  // uBlock Origin lists
  { name: 'ublockAds', url: UBO_ASSETS_BASE + 'filters/ublock-filters-ads.txt' },
  { name: 'ublockPrivacy', url: UBO_ASSETS_BASE + 'filters/ublock-filters-privacy.txt' },
  { name: 'ublockBadware', url: UBO_ASSETS_BASE + 'filters/ublock-filters-badware.txt' },
  { name: 'ublockUnbreak', url: UBO_ASSETS_BASE + 'filters/ublock-filters-unbreak.txt' },
  // AdGuard lists
  { name: 'adguardTracking', url: ADGUARD_BASE + 'adguard-tracking.txt' },
  { name: 'adguardSocial', url: ADGUARD_BASE + 'adguard-social.txt' },
  { name: 'adguardAnnoyances', url: ADGUARD_BASE + 'adguard-annoyances.txt' }
];

let rawRules = [];
let regexRules = [];

// Load all lists automatically
export async function loadPrivacyFilters() {
  const fetches = FILTER_LISTS.map(list => fetch(list.url));
  const responses = await Promise.all(fetches);

  rawRules = [];
  for (const res of responses) {
    if (!res.ok) continue;
    const text = await res.text();
    const lines = text.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('!') || line.startsWith('[')) continue; // skip comments & metadata
      rawRules.push(line);
    }
  }

  compileRules();
  console.log(`Loaded ${rawRules.length} privacy rules.`);
}

// Compile rules into regex (basic approximation)
function compileRules() {
  regexRules = rawRules.map(rule => {
    let r = rule
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\^/g, '(?:[\\/\\?=&]|$)');

    if (r.startsWith('\\|\\|')) r = '^([^:/]*\\.)?' + r.slice(4); // domain prefix
    else if (r.startsWith('\\|')) r = '^' + r.slice(2);

    try { return new RegExp(r); } 
    catch { return null; }
  }).filter(r => r);
}

// Check if URL matches any privacy filter
export function matchesPrivacyFilters(url) {
  for (const re of regexRules) {
    if (re.test(url)) return true;
  }
  return false;
}
