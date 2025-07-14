// FocusGuard Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profile-select');
  const activateBtn = document.getElementById('activate-btn');
  const profileInfo = document.getElementById('profile-info');

  // Load profiles from storage
  const { profiles, activeProfile } = await chrome.storage.local.get(['profiles', 'activeProfile']);
  profileSelect.innerHTML = '';
  Object.keys(profiles || {}).forEach(profile => {
    const option = document.createElement('option');
    option.value = profile;
    option.textContent = profile;
    if (profile === activeProfile) option.selected = true;
    profileSelect.appendChild(option);
  });

  function showProfileInfo(profileName) {
    const profile = profiles[profileName];
    if (!profile) return profileInfo.textContent = '';
    profileInfo.innerHTML = `
      <strong>Blocked Sites:</strong> ${profile.blockedSites.join(', ') || 'None'}<br>
      <strong>Daily Limit:</strong> ${profile.dailyLimitMinutes} min<br>
      ${profile.slackNotification ? '<strong>Slack Notification Enabled</strong><br>' : ''}
      ${profile.motivationalQuotes ? '<strong>Motivational Quotes Enabled</strong><br>' : ''}
    `;
  }

  showProfileInfo(profileSelect.value);
  profileSelect.addEventListener('change', e => {
    showProfileInfo(e.target.value);
  });

  activateBtn.addEventListener('click', async () => {
    const selected = profileSelect.value;
    try {
      // TODO: Add optional challenge before switching profiles
      await chrome.storage.local.set({ activeProfile: selected });
      showProfileInfo(selected);
      window.close();
    } catch (err) {
      alert('Error activating profile: ' + err.message);
    }
  });
});