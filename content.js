// Content Script for Website Blocking
// Checks if the current site is blocked and shows a block page

(async function () {
  try {
    // Get blocked sites from storage
    const { blockedSites } = await chrome.storage.local.get(["blockedSites"]);

    if (!blockedSites || blockedSites.length === 0) {
      return; // No blocked sites, exit
    }

    // Get current hostname and clean it up
    const hostname = window.location.hostname
      .replace(/^www\./, "")
      .toLowerCase();

    // Check if current site is blocked
    const isBlocked = blockedSites.some((site) => {
      return hostname.includes(site) || site.includes(hostname);
    });

    if (isBlocked) {
      // Show block page
      showBlockPage(hostname);

      // Prevent navigation
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener("popstate", function (event) {
          window.history.pushState(null, null, window.location.href);
        });
      }
    }
  } catch (error) {
    console.error("Error in content script:", error);
  }
})();

function showBlockPage(hostname) {
  // Create a full-screen blocking overlay
  const blockPage = document.createElement("div");
  blockPage.id = "website-blocker-overlay";
  blockPage.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: white;
      text-align: center;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.1);
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        max-width: 500px;
        margin: 20px;
      ">
        <h1 style="font-size: 3em; margin-bottom: 20px;">🚫</h1>
        <h2 style="font-size: 2em; margin-bottom: 20px; font-weight: 300;">Site Blocked</h2>
        <p style="font-size: 1.2em; margin-bottom: 10px; opacity: 0.9;">
          <strong>${hostname}</strong> is blocked to help you stay focused.
        </p>
        <p style="font-size: 1em; opacity: 0.8; margin-bottom: 30px;">
          Remove this site from your blocked list in the new tab page to access it again.
        </p>
        <button id="goBackBtn" style="
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          margin-right: 10px;
        ">
          ← Go Back
        </button>
        <button id="openNewTabBtn" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: bold;
        ">
          Open Productivity Hub
        </button>
      </div>
    </div>
  `;

  // Remove existing content and add block page
  document.documentElement.innerHTML = "";
  document.documentElement.appendChild(blockPage);

  // Add event listeners to buttons
  const goBackBtn = blockPage.querySelector("#goBackBtn");
  const openNewTabBtn = blockPage.querySelector("#openNewTabBtn");

  goBackBtn.addEventListener("click", () => {
    window.history.back();
  });

  goBackBtn.addEventListener("mouseover", () => {
    goBackBtn.style.background = "rgba(255, 255, 255, 0.3)";
  });

  goBackBtn.addEventListener("mouseout", () => {
    goBackBtn.style.background = "rgba(255, 255, 255, 0.2)";
  });

  openNewTabBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openNewTab" });
  });

  openNewTabBtn.addEventListener("mouseover", () => {
    openNewTabBtn.style.transform = "translateY(-2px)";
  });

  openNewTabBtn.addEventListener("mouseout", () => {
    openNewTabBtn.style.transform = "translateY(0)";
  });

  // Prevent scrolling
  document.documentElement.style.overflow = "hidden";
}

// Listen for updates to blocked sites
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBlockedSites") {
    const hostname = window.location.hostname
      .replace(/^www\./, "")
      .toLowerCase();
    const blockedSites = message.blockedSites || [];

    // Check if current site is now blocked
    const isBlocked = blockedSites.some((site) => {
      return hostname.includes(site) || site.includes(hostname);
    });

    if (isBlocked) {
      // Site is now blocked, show block page
      showBlockPage(hostname);
    } else {
      // Site is no longer blocked, remove block page if it exists
      const blockPage = document.getElementById("website-blocker-overlay");
      if (blockPage) {
        blockPage.remove();
        document.documentElement.style.overflow = "";
        // Reload the page to restore original content
        window.location.reload();
      }
    }
  }
});
