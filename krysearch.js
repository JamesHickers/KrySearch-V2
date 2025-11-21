// KrySearch V3 — Fully Private, Open Source AI, AI-DNS & Full PrivacyFilters Integration
import { extractHostname } from './utils.js';
import { smartCleaner, installAntiTracker } from './privacyCleaner.js';
import { proxyFetch } from './proxyClient.js';
import { initFingerprintSpoofer } from './fingerprintSpoofer.js';
import { generateSummary, scoreLinkRisk } from './openSourceAI.js';
import { aiDnsResolve } from './smartDns.js'; // Free AI DNS resolver
import { loadPrivacyFilters, matchesPrivacyFilters } from './PrivacyFilters.js'; // uBlock Origin + AdGuard lists

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const FILTER_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24; // daily
let privacyFiltersLoaded = false;

// ---------------------------------------------------------------------------
// AI-POWERED URL SUMMARY + RISK CHECK
// ---------------------------------------------------------------------------
async function aiSummary(url) {
  try {
    const res = await proxyFetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`);
    const data = await res.json();
    const text = `${data.data?.title || ''}. ${data.data?.description || ''}`;
    const summarized = await generateSummary(text);
    return summarized.length > 120 ? summarized.slice(0, 117) + '...' : summarized;
  } catch {
    return 'No summary available.';
  }
}

async function aiScoreLink(url) {
  try {
    return await scoreLinkRisk(url);
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// AUTO-LOAD & AUTO-UPDATE PRIVACY FILTERS
// ---------------------------------------------------------------------------
async function ensurePrivacyFilters() {
  if (privacyFiltersLoaded) return;
  try {
    await loadPrivacyFilters();
    privacyFiltersLoaded = true;
    // schedule periodic refresh
    setInterval(async () => {
      try {
        await loadPrivacyFilters();
        console.log('PrivacyFilters: refreshed.');
      } catch (err) {
        console.warn('PrivacyFilters: refresh failed', err);
      }
    }, FILTER_REFRESH_INTERVAL_MS);
    console.log('PrivacyFilters: initial load complete.');
  } catch (err) {
    console.error('PrivacyFilters: failed to load', err);
  }
}

// Start loading filters immediately (fire and forget)
ensurePrivacyFilters();

// ---------------------------------------------------------------------------
// NETWORK INTERCEPTION: fetch + XHR hooking to apply privacy filters
// ---------------------------------------------------------------------------
(function interceptNetwork() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init = {}) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url && matchesPrivacyFilters(url)) {
        console.warn('PrivacyFilters blocked fetch:', url);
        return Promise.reject(new Error('Blocked by PrivacyFilters'));
      }
      // also block by AI DNS if desired (light touch)
      try {
        const host = extractHostname(url).replace(/^www\./, '');
        if (host && !trustedDomains.has(host)) {
          const resolved = await aiDnsResolve(host);
          if (!resolved) {
            console.warn('AI DNS blocked fetch (unresolvable):', host);
            return Promise.reject(new Error('Blocked by AI DNS'));
          }
        }
      } catch (e) { /* DNS check best-effort, ignore errors */ }

      return originalFetch(input, init);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  // XHR
  const OriginalXHR = window.XMLHttpRequest;
  function CustomXHR() {
    const xhr = new OriginalXHR();
    const open = xhr.open;
    xhr.open = function(method, url, async, user, password) {
      try {
        if (url && matchesPrivacyFilters(url)) {
          console.warn('PrivacyFilters blocked XHR:', url);
          // Do not open the request at all
          return;
        }
        // Optionally: AI DNS resolve early
        const host = extractHostname(url).replace(/^www\./, '');
        if (host && !trustedDomains.has(host)) {
          aiDnsResolve(host).then(resolved => {
            if (!resolved) {
              console.warn('AI DNS blocked XHR (unresolvable):', host);
              // do not open — swallow silently
              return;
            }
            open.call(this, method, url, async, user, password);
          }).catch(() => {
            // On DNS error, allow fallback to open to prevent breakage
            open.call(this, method, url, async, user, password);
          });
          return;
        }
      } catch (e) {
        // If anything goes wrong, fall back to default behavior
      }
      return open.call(this, method, url, async, user, password);
    };
    return xhr;
  }
  window.XMLHttpRequest = CustomXHR;
})();

// ---------------------------------------------------------------------------
// LINK INTERCEPTION & AI-DNS + PRIVACY FILTERS
// ---------------------------------------------------------------------------
document.addEventListener('click', async (e) => {
  try {
    const link = e.target.closest('a');
    if (!link || !link.href) return;
    const url = link.href;
    if (!url.startsWith('http')) return;

    const host = extractHostname(url).replace(/^www\./, '');
    if (trustedDomains.has(host)) return;

    e.preventDefault();

    // Ensure privacy filters are loaded
    await ensurePrivacyFilters();

    // AI DNS resolution
    const resolved = await aiDnsResolve(host);
    if (!resolved) {
      blacklist.add(host);
      alert('Blocked: could not resolve domain via AI DNS.');
      return;
    }

    // Privacy filters (uBlock + AdGuard)
    if (matchesPrivacyFilters(url) || matchesPrivacyFilters(host)) {
      blacklist.add(host);
      alert('Blocked by Privacy Filters (uBlock/AdGuard).');
      return;
    }

    // Fallback uBlock engine compatibility (for legacy code paths)
    // If uBlockMatrix/uBlockRules were used elsewhere, try to support them if available
    if (typeof uBlockMatrix === 'function' && Array.isArray(window.uBlockRules) && window.uBlockRules.some) {
      const blockedByLegacy = window.uBlockRules.some(rule => {
        try { return uBlockMatrix(host, rule); } catch { return false; }
      });
      if (blockedByLegacy) {
        blacklist.add(host);
        alert('Blocked by legacy uBlock rules.');
        return;
      }
    }

    // AI Risk + remote scans
    const [unsafe, aiScore] = await Promise.all([fullScan(url, host), aiScoreLink(url)]);
    if (unsafe || aiScore > 50) {
      blacklist.add(host);
      alert('Blocked: site flagged as unsafe or high AI risk.');
      return;
    }

    showPreview(url);
  } catch (err) {
    // On unexpected errors, fallback to safe behavior: block navigation and log
    console.error('Link interception error:', err);
    e?.preventDefault?.();
    alert('Navigation blocked due to an internal error. Check console.');
  }
});

// ---------------------------------------------------------------------------
// INIT KRYSEARCH PLUGIN (unchanged UI, wired to privacy filters automatically)
// ---------------------------------------------------------------------------
export async function installKrySearchPlugin() {
  if (!document.querySelector('#kry-search-bar')) {
    const bar = document.createElement('div');
    bar.id = 'kry-search-bar';
    bar.innerHTML = `
      <style>
        #kry-search-bar { display:flex; gap:6px; align-items:center; max-width:170px; margin:4px auto; }
        #kry-search-bar input { width:100%; padding:5px 8px; background:#111; border:1px solid #00bcd4; color:white; border-radius:16px; font-size:12px; }
        #toggle-search { padding:5px 8px; border-radius:16px; background:#00bcd4; border:none; color:black; font-size:11px; cursor:pointer; }
      </style>
      <form id='kry-search-form'>
        <input type='search' name='q' placeholder='Search Krynet.ai'/>
      </form>
      <button id='toggle-search'>ON</button>
    `;
    const container = document.querySelector('#sidebar') || document.body;
    container.insertBefore(bar, container.firstChild);

    const toggle = bar.querySelector('#toggle-search');
    toggle.onclick = () => {
      bar.classList.toggle('hidden');
      toggle.textContent = bar.classList.contains('hidden') ? 'OFF' : 'ON';
    };

    const form = bar.querySelector('#kry-search-form');
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      const query = form.querySelector('input').value.trim();
      if (!query) return;
      await bravePrivateSearch(query);
    };
  }

  // Initialize privacy & fingerprint protections (non-blocking)
  Promise.allSettled([
    smartCleaner(),
    installAntiTracker(),
    initFingerprintSpoofer(),
    ensurePrivacyFilters() // start filter load if not already started
  ]);
}
