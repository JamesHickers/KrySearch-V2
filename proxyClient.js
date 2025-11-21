export async function proxyFetch(url, options = {}) {
  const proxyBase = 'https://api.allorigins.win/raw?url=';
  const finalUrl = proxyBase + encodeURIComponent(url);
  return fetch(finalUrl, options);
}
