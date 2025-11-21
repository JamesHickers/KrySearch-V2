// proxyClient.js — simple proxy fetch for KrySearch

async function proxyFetch(url, options = {}) {
  const proxyBase = 'https://api.allorigins.win/raw?url=';
  const finalUrl = proxyBase + encodeURIComponent(url);
  return fetch(finalUrl, options);
}

// expose globally
window.proxyFetch = proxyFetch;
