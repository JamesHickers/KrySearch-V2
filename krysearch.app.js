// krysearch.app.js — single-file loader for KrySearch V2/V3
(function() {
  const BaseURL = 'https://raw.githubusercontent.com/JamesHickers/KrySearch-V2/main/';
  const scriptsToLoad = [
    'privacyfilters.js',
    'smartDns.js',
    'ublockEngine.js',
    'utils.js',
    'proxyClient.js',
    'privacyCleaner.js',
    'fingerprintSpoofer.js',
    'openSourceAI.js',
    'krysearch-bindings.js',
    'krysearch.js'
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

  async function initKrySearch() {
    try {
      // load all scripts in order
      for (const s of scriptsToLoad) {
        await loadScript(BaseURL + s);
      }

      // wait until installKrySearchPlugin exists
      if (typeof installKrySearchPlugin !== 'function') {
        throw new Error('installKrySearchPlugin not found');
      }

      // init plugin
      const plugin = installKrySearchPlugin({
        updateFilters: true,
        enableUBlockFilters: true,
        enableAdGuardFilters: true,
        enablePrivacyFilters: true,
        autoUpdateInterval: 3600
      });
      window.KrySearch = plugin;

      // --- SEARCH BAR ---
      const searchInput = document.getElementById("kry-search-input");
      const toggleBtn = document.getElementById("toggle-search");
      const searchBar = document.getElementById("kry-search-bar");

      function dispatchKrySearchQuery(rawQuery) {
        const query = rawQuery.trim();
        if (!query) return;

        if (window.KrySearchBus && window.KrySearchBus.emit) {
          window.KrySearchBus.emit("query", query); return;
        }
        if (window.KrySearch && typeof window.KrySearch.dispatch === "function") {
          window.KrySearch.dispatch("query", query); return;
        }
        if (window.KrySearch && typeof window.KrySearch.openSafeSearch === "function") {
          window.KrySearch.openSafeSearch(query); return;
        }
        if (window.krysearch && typeof window.krysearch.query === "function") {
          window.krysearch.query(query); return;
        }
        window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
      }

      if (searchInput) {
        searchInput.addEventListener("keydown", e => {
          if (e.key === "Enter") dispatchKrySearchQuery(searchInput.value);
        });
      }

      if (toggleBtn && searchBar) {
        toggleBtn.addEventListener("click", () => {
          const hidden = searchBar.style.display === "none";
          searchBar.style.display = hidden ? "flex" : "none";
          toggleBtn.textContent = hidden ? "ON" : "OFF";
          if (hidden && searchInput) searchInput.focus();
        });
      }

      // intercept all links
      document.querySelectorAll('.message a').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          window.dispatchEvent(new CustomEvent('krysearch-safeclick', { detail: { url: a.href } }));
        });
      });

      console.log('KrySearch loaded successfully.');
    } catch (err) {
      console.error('Failed to initialize KrySearch:', err);
    }
  }

  // wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKrySearch);
  } else {
    initKrySearch();
  }
})();
