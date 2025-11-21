// utils.js — tiny helper utilities

function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// expose globally
window.extractHostname = extractHostname;
