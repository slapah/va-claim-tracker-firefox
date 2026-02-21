let latestResponse = '';

// Grab the API response when va.gov fetches claim data
browser.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.url.includes('/benefits_claims')) {
      try {
        const response = await fetch(details.url, {
          credentials: 'include'
        });
        const json = await response.json();
        latestResponse = JSON.stringify(json, null, 2);
        console.log('Captured claim status:', latestResponse);
      } catch (err) {
        console.error('Error fetching response:', err);
      }
    }
  },
  { urls: ['*://api.va.gov/*'] }
);

// Send cached data to popup when it asks
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getLatestClaimStatus') {
    return Promise.resolve({ data: latestResponse });
  }
});

// Let popup know when page reloads
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    browser.runtime.sendMessage({ type: 'pageReloaded' }).catch(() => {
      // popup might not be open, that's fine
    });
  }
});
