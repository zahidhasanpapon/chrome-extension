// FocusGuard Options Script

const profilesList = document.getElementById('profiles-list');
const addProfileBtn = document.getElementById('add-profile-btn');
const profileEditor = document.getElementById('profile-editor');

// Load and display profiles
async function loadProfiles() {
  const { profiles } = await chrome.storage.local.get('profiles');
  profilesList.innerHTML = '';
  Object.entries(profiles || {}).forEach(([name, profile]) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${name}</strong> - Blocked: ${profile.blockedSites.join(', ')} | Limit: ${profile.dailyLimitMinutes} min
      <button data-edit="${name}">Edit</button>
      <button data-delete="${name}">Delete</button>
    `;
    profilesList.appendChild(div);
  });
}

// Add/Edit/Delete logic (scaffolded, to be expanded)
profilesList.addEventListener('click', async (e) => {
  if (e.target.dataset.edit) {
    // TODO: Show editor for profile, pre-fill fields, validate input
    // ...
  } else if (e.target.dataset.delete) {
    const name = e.target.dataset.delete;
    try {
      const { profiles } = await chrome.storage.local.get('profiles');
      delete profiles[name];
      await chrome.storage.local.set({ profiles });
      loadProfiles();
    } catch (err) {
      alert('Error deleting profile: ' + err.message);
    }
  }
});

addProfileBtn.addEventListener('click', () => {
  // TODO: Show empty editor for new profile, validate input
  // ...
});

// Initial load
loadProfiles();