// fingerprintSpoofer.js — spoof basic fingerprint fields

export function initFingerprintSpoofer() {
  Object.defineProperty(navigator, 'userAgent', {
    get: () =>
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114 Safari/537.36"
  });

  Object.defineProperty(navigator, 'platform', {
    get: () => "Win32"
  });

  Object.defineProperty(navigator, 'languages', {
    get: () => ["en-US", "en"]
  });

  if (navigator.plugins) {
    Object.defineProperty(navigator, 'plugins', {
      get: () => []
    });
  }

  if (navigator.hardwareConcurrency) {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 4
    });
  }
}
