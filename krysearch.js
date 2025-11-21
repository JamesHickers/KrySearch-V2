// krysearch.js — KrySearch plugin (V3) for GitHub Pages
(function() {
  const BaseURL = 'https://raw.githubusercontent.com/JamesHickers/KrySearch-V2/main/';

  // Dynamically load dependencies
  const scriptsToLoad = [
    'utils.js',
    'privacyCleaner.js',
    'proxyClient.js',
    'fingerprintSpoofer.js',
    'openSourceAI.js',
    'smartDns.js',
    'PrivacyFilters.js'
  ];

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load ' + url));
      document.head.appendChild(script);
    });
  }

  async function initDependencies() {
    for (const s of scriptsToLoad) {
      await loadScript(BaseURL + s);
    }
  }

  async function installKrySearchPlugin(options) {
    await initDependencies();

    // default options
    options = Object.assign({
      updateFilters: true,
      enableUBlockFilters: true,
      enableAdGuardFilters: true,
      enablePrivacyFilters: true,
      autoUpdateInterval: 3600
    }, options);

    // Load privacy & fingerprint protections
    Promise.allSettled([
      smartCleaner && smartCleaner(),
      installAntiTracker && installAntiTracker(),
      initFingerprintSpoofer && initFingerprintSpoofer(),
      ensurePrivacyFilters && ensurePrivacyFilters()
    ]);

    // Setup search bar if missing
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
        if (typeof bravePrivateSearch === 'function') await bravePrivateSearch(query);
        else window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
      };
    }

    return {
      dispatch: function(event, data) {
        if (event === 'query' && data) {
          const input = document.querySelector('#kry-search-input');
          if (input) input.value = data;
        }
      }
    };
  }

  // Expose globally
  window.installKrySearchPlugin = installKrySearchPlugin;

})();
