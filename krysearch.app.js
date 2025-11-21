<script type="module">
    import "./privacyfilters.js";
    import { installKrySearchPlugin } from "./krysearch.js";

    /* ----------- INITIALIZE KRYSEARCH ----------- */

    window.addEventListener("DOMContentLoaded", () => {
      const plugin = installKrySearchPlugin({
        updateFilters: true,
        enableUBlockFilters: true,
        enableAdGuardFilters: true,
        enablePrivacyFilters: true,
        autoUpdateInterval: 3600
      });

      // store instance
      window.KrySearch = plugin;
    });


    /* ----------- SEARCH BAR BINDING (THE FIX YOU NEEDED) ----------- */

    const searchInput = document.getElementById("kry-search-input");
    const toggleBtn = document.getElementById("toggle-search");
    const searchBar = document.getElementById("kry-search-bar");

    // Full compatibility: V2, V3, older builds, fallback
    function dispatchKrySearchQuery(rawQuery) {
      const query = rawQuery.trim();
      if (!query) return;

      // V3: Unified Event Bus
      if (window.KrySearchBus && window.KrySearchBus.emit) {
        window.KrySearchBus.emit("query", query);
        return;
      }

      // V2: Dispatch function
      if (window.KrySearch && typeof window.KrySearch.dispatch === "function") {
        window.KrySearch.dispatch("query", query);
        return;
      }

      // V2 (older): Search API
      if (window.KrySearch && typeof window.KrySearch.openSafeSearch === "function") {
        window.KrySearch.openSafeSearch(query);
        return;
      }

      // V1 compatibility
      if (window.krysearch && typeof window.krysearch.query === "function") {
        window.krysearch.query(query);
        return;
      }

      // Final fallback
      window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
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
