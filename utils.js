// utils.js — tiny helper utilities

export function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
