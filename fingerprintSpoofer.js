// fingerprintSpoofer.js — fully anonymized fingerprint for Krynet/KrySearch

function initFingerprintSpoofer() {
  try {
    // Generic User-Agent
    Object.defineProperty(navigator, 'userAgent', {
      get: () =>
        "Mozilla/5.0 (compatible; Krynet/1.0; +https://krynet.ai)"
    });

    // Hide platform
    Object.defineProperty(navigator, 'platform', {
      get: () => "Anonymous"
    });

    // Spoof languages to universal anonymous
    Object.defineProperty(navigator, 'languages', {
      get: () => ["en-US","en","fr","de","es","it","ru","zh","ja","ko","ar"]
    });

    // Hide plugins
    if (navigator.plugins) {
      Object.defineProperty(navigator, 'plugins', {
        get: () => []
      });
    }

    // Limit hardware info
    if (navigator.hardwareConcurrency) {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 1
      });
    }

    // Spoof device memory
    if (navigator.deviceMemory) {
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 1
      });
    }

    // Override screen size to generic
    if (screen) {
      Object.defineProperty(screen, 'width', { get: () => 1920 });
      Object.defineProperty(screen, 'height', { get: () => 1080 });
      Object.defineProperty(screen, 'availWidth', { get: () => 1920 });
      Object.defineProperty(screen, 'availHeight', { get: () => 1080 });
      Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
      Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
    }

    // Optional: spoof timezone
    if (Intl && Intl.DateTimeFormat) {
      const original = Intl.DateTimeFormat.prototype.resolvedOptions;
      Intl.DateTimeFormat.prototype.resolvedOptions = function() {
        const ro = original.apply(this, arguments);
        ro.timeZone = "UTC";
        return ro;
      };
    }

    console.log("[KrySearch] Fingerprint anonymizer active.");
  } catch (err) {
    console.warn("[KrySearch] Fingerprint spoof failed:", err);
  }
}

// attach globally
window.initFingerprintSpoofer = initFingerprintSpoofer;
