// Toolbar icon (or Alt+Shift+R): toggle the drawer on an x.com tab; anywhere
// else, or on an x.com tab opened before the extension was installed, open
// the home timeline.
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'toggle' });
  } catch {
    chrome.tabs.create({ url: 'https://x.com/home' });
  }
});
