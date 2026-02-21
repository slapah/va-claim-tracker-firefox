document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refreshBtn');
  const ratedOutput = document.getElementById('ratedOutput');
  const refreshRatedBtn = document.getElementById('refreshRatedBtn');
  const hideIdCheckbox = document.getElementById('hideIdCheckbox');

  refreshRatedBtn.addEventListener('click', () => {
    ratedOutput.textContent = 'Loading disability ratings...';

    fetch('https://api.va.gov/v0/rated_disabilities', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        ratedOutput.innerHTML = renderJson(json);
      })
      .catch(err => {
        ratedOutput.textContent = 'Failed to load ratings. Make sure you are logged into VA.gov.';
        console.error(err);
      });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id) {
          browser.tabs.reload(tabs[0].id);
          setTimeout(updateStatus, 2000);
        }
      });
    });
  }

  if (hideIdCheckbox) {
    hideIdCheckbox.addEventListener('change', updateStatus);
  }

  updateStatus();
});

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'pageReloaded') {
    updateStatus();
  }
});

function updateStatus() {
  const output = document.getElementById('output');
  if (!output) return;

  output.textContent = 'Refreshing...';

  browser.runtime.sendMessage({ type: 'getLatestClaimStatus' }).then((response) => {
    if (!response || !response.data) {
      output.textContent = 'No claim data yet. Visit your claim status page on VA.gov first, then open this popup.';
      return;
    }

    try {
      const json = JSON.parse(response.data);

      const priorityKeys = [
        'tempJurisdiction',
        'latestPhaseType',
        'Phase Change Date',
        'decisionLetterSent',
        'status'
      ];

      let topCards = '';
      for (const key of priorityKeys) {
        const value = findKeyDeep(json, key);
        if (value !== undefined) {
          topCards += `
            <div class="card highlight-card">
              <div class="label">${formatLabel(key)}:</div>
              <div class="value highlight">${value}</div>
            </div>
          `;
        }
      }

      output.innerHTML = topCards + renderJson(json);
    } catch (e) {
      output.textContent = 'Failed to parse claim data.';
    }
  }).catch(() => {
    output.textContent = 'Could not reach background script. Try reloading the extension.';
  });
}

// search nested JSON for a specific key (case-insensitive)
function findKeyDeep(obj, targetKey) {
  if (typeof obj !== 'object' || obj === null) return undefined;

  for (const [key, value] of Object.entries(obj)) {
    if (key.toLowerCase() === targetKey.toLowerCase()) {
      return value;
    }
    if (typeof value === 'object') {
      const found = findKeyDeep(value, targetKey);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

// render the JSON as nested cards, highlight tempJurisdiction
function renderJson(obj, indent = 0) {
  let html = '';
  const HIGHLIGHT_KEYS = ['tempjurisdiction'];
  const hideId = document.getElementById('hideIdCheckbox')?.checked;

  for (const [key, value] of Object.entries(obj)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
    const label = formatLabel(key);
    const shouldHighlight = HIGHLIGHT_KEYS.includes(normalized);

    if (hideId && normalized === 'id') continue;

    if (typeof value === 'object' && value !== null) {
      html += `
        <div class="card nested">
          <div class="label">${label}:</div>
          ${renderJson(value, indent + 1)}
        </div>`;
    } else {
      const valClass = shouldHighlight ? 'highlight' : '';
      html += `
        <div class="card">
          <div class="label">${label}:</div>
          <div class="value ${valClass}">${value}</div>
        </div>`;
    }
  }

  return html;
}

// camelCase -> Camel Case
function formatLabel(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}
