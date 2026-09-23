import { SOURCE_REPOSITORY_URL } from '../shared/constants.js';
import { formatBytes, formatDate, readSettings, writeSettings } from '../shared/utils.js';

const formatSelect = document.querySelector('#default-format');
const quality = document.querySelector('#quality');
const qualityValue = document.querySelector('#quality-value');
const filenameRule = document.querySelector('#filename-rule');
const historyEnabled = document.querySelector('#history-enabled');
const historyList = document.querySelector('#history-list');
const status = document.querySelector('#save-status');

let settings;
const ready = init();

async function init() {
  settings = await readSettings();
  document.querySelector('#extension-version').textContent = chrome.runtime.getManifest().version;
  formatSelect.value = settings.defaultFormat;
  quality.value = String(Math.round(settings.quality * 100));
  qualityValue.value = `${quality.value}%`;
  qualityValue.textContent = `${quality.value}%`;
  filenameRule.value = settings.filenameRule;
  historyEnabled.checked = settings.historyEnabled;
  renderHistory();
  setupSourceLink();
}

formatSelect.addEventListener('change', async () => {
  await ready;
  settings.defaultFormat = formatSelect.value;
  await saveSettings('Preferred format saved.');
});

quality.addEventListener('input', () => {
  qualityValue.value = `${quality.value}%`;
  qualityValue.textContent = `${quality.value}%`;
});

quality.addEventListener('change', async () => {
  await ready;
  settings.quality = Number(quality.value) / 100;
  await saveSettings('Quality setting saved.');
});

filenameRule.addEventListener('change', async () => {
  await ready;
  settings.filenameRule = filenameRule.value;
  await saveSettings('Filename rule saved.');
});

historyEnabled.addEventListener('change', async () => {
  await ready;
  settings.historyEnabled = historyEnabled.checked;
  await saveSettings(historyEnabled.checked ? 'Local history is on.' : 'Local history is off.');
});

document.querySelector('#clear-history').addEventListener('click', async () => {
  await ready;
  settings.recentSaves = [];
  await saveSettings('Recent saves cleared from this device.');
  renderHistory();
});

async function saveSettings(message) {
  settings = await writeSettings(settings);
  status.textContent = message;
  window.setTimeout(() => { status.textContent = ''; }, 1800);
}

function renderHistory() {
  if (!settings.historyEnabled) {
    historyList.innerHTML = '<div class="history-empty">History is off. New saves will not be listed here.</div>';
    return;
  }
  if (!settings.recentSaves.length) {
    historyList.innerHTML = '<div class="history-empty">Your recent saves will appear here.</div>';
    return;
  }
  historyList.replaceChildren(...settings.recentSaves.map((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = `
      <span class="history-format">${escapeHtml(item.format)}</span>
      <span>
        <span class="history-name" title="${escapeHtml(item.filename)}">${escapeHtml(item.filename)}</span>
        <span class="history-meta">${escapeHtml(item.domain)} · ${formatBytes(item.bytes)}</span>
      </span>
      <span class="history-date">${formatDate(item.timestamp)}</span>
    `;
    return row;
  }));
}

function setupSourceLink() {
  const link = document.querySelector('#source-link');
  if (!SOURCE_REPOSITORY_URL) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.title = 'Add the public repository URL before publishing.';
    link.addEventListener('click', (event) => event.preventDefault());
  } else {
    link.href = SOURCE_REPOSITORY_URL;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
