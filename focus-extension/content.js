// FocusGuard Content Script
// Checks if the current site is blocked and notifies background

(async function() {
  const { activeProfile, profiles } = await chrome.storage.local.get(['activeProfile', 'profiles']);
  if (!activeProfile || !profiles || !profiles[activeProfile]) return;
  const blockedSites = profiles[activeProfile].blockedSites || [];
  const hostname = window.location.hostname.replace(/^www\./, '');
  if (blockedSites.some(site => hostname.includes(site))) {
    // Optionally, redirect or show a block page
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;"><h1>Stay Focused!</h1><p>This site is blocked by your FocusGuard profile.</p></div>';
    // TODO: If motivationalQuotes is enabled, show a random quote from assets/quotes.json
  }
})();