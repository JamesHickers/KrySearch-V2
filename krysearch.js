import { extractHostname } from './utils.js';
import { smartCleaner, installAntiTracker } from './privacyCleaner.js';
import { nextDNSCheck } from './dnsResolver.js';
import { proxyFetch } from './proxyClient.js';
import { initFingerprintSpoofer } from './fingerprintSpoofer.js';
import { generateSummary, scoreLinkRisk } from './openSourceAI.js'; // open-source AI library only

// ---------------------------------------------------------------------------
// AI-POWERED URL SUMMARY + SAFETY
// ---------------------------------------------------------------------------

async function aiSummary(url) {
  try {
    const res = await proxyFetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`);
    const data = await res.json();
    const text = `${data.data?.title || ''}. ${data.data?.description || ''}`;
    const summarized = await generateSummary(text); // condensed, non-invasive
    return summarized.length > 120 ? summarized.slice(0, 117) + '...' : summarized;
  } catch {
    return 'No summary available.';
  }
}

async function aiScoreLink(url) {
  try {
    return await scoreLinkRisk(url); // 0-100 risk score, non-invasive
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// LINK INTERCEPTION & PREVIEW
// ---------------------------------------------------------------------------

document.addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  if (!link || !link.href) return;
  const url = link.href;
  if (!url.startsWith('http')) return;

  const host = extractHostname(url).replace(/^www\./, '');
  if (trustedDomains.has(host)) return;

  e.preventDefault();
  const [unsafe, aiScore] = await Promise.all([fullScan(url, host), aiScoreLink(url)]);

  if (unsafe || aiScore > 50) {
    blacklist.add(host);
    alert('Blocked: site flagged as unsafe or high AI risk.');
    return;
  }
  showPreview(url);
});

// ---------------------------------------------------------------------------
// INIT KRYSEARCH INSIDE KRYNET.AI
// ---------------------------------------------------------------------------

export async function installKrySearchPlugin() {
  if (!document.querySelector('#kry-search-bar')) {
    const bar = document.createElement('div');
    bar.id = 'kry-search-bar';
    bar.innerHTML = `
      <style>
        #kry-search-bar { display:flex; gap:6px; align-items:center; max-width:170px; margin:4px auto; }
        #kry-search-bar input { width:100%;padding:5px 8px;background:#111;border:1px solid #00bcd4;color:white;border-radius:16px;font-size:12px; }
        #toggle-search { padding:5px 8px;border-radius:16px;background:#00bcd4;border:none;color:black;font-size:11px;cursor:pointer; }
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
  Promise.allSettled([
    smartCleaner(),
    installAntiTracker(),
    initFingerprintSpoofer()
  ]);
}
