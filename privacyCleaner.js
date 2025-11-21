// privacyCleaner.js — cookie cleaner + anti‑tracker

export async function smartCleaner() {
  try {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [name] = c.split('=');
      if (name && (name.trim().toLowerCase().includes('track') ||
                   name.trim().toLowerCase().includes('ad') ||
                   name.trim().toLowerCase().includes('sess'))) {
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
      }
    }

    for (const key of Object.keys(localStorage)) {
      if (key.toLowerCase().includes('track') || key.toLowerCase().includes('ad')) {
        localStorage.removeItem(key);
      }
    }

    for (const key of Object.keys(sessionStorage)) {
      if (key.toLowerCase().includes('track') || key.toLowerCase().includes('ad')) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {}
}

export function installAntiTracker() {
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    let url = typeof input === 'string' ? input : input?.url || '';
    if (isTrackingUrl(url)) return new Promise(() => {});
    init.credentials = 'omit';
    if (!init.headers) init.headers = {};
    delete init.headers['Referer'];
    delete init.headers['Origin'];
    return originalFetch(input, init);
  };

  const originalXHR = window.XMLHttpRequest;
  function CustomXHR() {
    const xhr = new originalXHR();
    const open = xhr.open;
    xhr.open = function(method, url, async, user, password) {
      this.withCredentials = false;
      if (isTrackingUrl(url)) return;
      return open.call(this, method, url, async, user, password);
    };
    return xhr;
  }
  window.XMLHttpRequest = CustomXHR;
}

function isTrackingUrl(url) {
  const trackers = [
    'doubleclick.net','google-analytics.com','googletagmanager.com',
    'facebook.net','facebook.com','ads.twitter.com','adservice.google.com',
    'amazon-adsystem.com','scorecardresearch.com','adroll.com',
    'quantserve.com','criteo.net','pubmatic.com','openx.net',
    'moatads.com','taboola.com','outbrain.com'
  ];
  try {
    const host = new URL(url).hostname;
    return trackers.some(t => host.includes(t));
  } catch {
    return false;
  }
}
