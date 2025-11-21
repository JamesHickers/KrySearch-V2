<script type="module">
  const BaseURL = 'https://raw.githubusercontent.com/JamesHickers/KrySearch-V2/main/';

  // Dynamic import for all modules
  await import(BaseURL + 'privacyfilters.js');

  const { installKrySearchPlugin } = await import(BaseURL + 'krysearch.js');

  /* ----------- INITIALIZE KRYSEARCH ----------- */
  const plugin = await installKrySearchPlugin({
    updateFilters: true,
    enableUBlockFilters: true,
    enableAdGuardFilters: true,
    enablePrivacyFilters: true,
    autoUpdateInterval: 3600
  });

  // store instance
  window.KrySearch = plugin;

  /* ----------- SEARCH BAR BINDING ----------- */
  const searchInput = document.getElementById("kry-search-input");
  const toggleBtn = document.getElementById("toggle-search");
  const searchBar = document.getElementById("kry-search-bar");

  function dispatchKrySearchQuery(rawQuery) {
    const query = rawQuery.trim();
    if (!query) return;

    if (window.KrySearchBus && window.KrySearchBus.emit) {
      window.KrySearchBus.emit("query", query);
      return;
    }

    if (window.KrySearch && typeof window.KrySearch.dispatch === "function") {
      window.KrySearch.dispatch("query", query);
      return;
    }

    if (window.KrySearch && typeof window.KrySearch.openSafeSearch === "function") {
      window.KrySearch.openSafeSearch(query);
      return;
    }

    if (window.krysearch && typeof window.krysearch.query === "function") {
      window.krysearch.query(query);
      return;
    }

    window.open(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // Enter = dispatch to KrySearch
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      dispatchKrySearchQuery(searchInput.value);
    }
  });

  /* ----------- SEARCH TOGGLE ----------- */
  toggleBtn.addEventListener("click", () => {
    const hidden = searchBar.style.display === "none";
    searchBar.style.display = hidden ? "flex" : "none";
    toggleBtn.textContent = hidden ? "ON" : "OFF";
    if (hidden) searchInput.focus();
  });
</script>
