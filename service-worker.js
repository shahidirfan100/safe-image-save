import { BADGE_CLEAR_ALARM, FORMATS, MAX_HISTORY_ITEMS } from './shared/constants.js';
import {
  buildFilename,
  mergeSettings,
  readSettings,
  writeSettings
} from './shared/utils.js';
import { convertImageInPage } from './shared/image-converter.js';
import { createContextMenuSetup } from './shared/context-menu-manager.js';

const MENU_PARENT_ID = 'safe-image-save';
const CONTEXT_MENU_ITEMS = [
  {
    id: MENU_PARENT_ID,
    title: 'Safe Image Save',
    contexts: ['image']
  },
  ...Object.entries(FORMATS).map(([format, config]) => ({
    id: `save-${format}`,
    parentId: MENU_PARENT_ID,
    title: `Save as ${config.label}`,
    contexts: ['image']
  }))
];

const setupContextMenus = createContextMenuSetup({
  removeAll: removeAllContextMenus,
  create: createContextMenu,
  items: CONTEXT_MENU_ITEMS
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await setupContextMenus();
    const settings = await readSettings();
    await writeSettings(settings);
  } catch (error) {
    console.error('Safe Image Save could not finish installation setup.', error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    await setupContextMenus();
  } catch (error) {
    console.error('Safe Image Save could not rebuild its image menu.', error);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== BADGE_CLEAR_ALARM) return;
  await chrome.action.setBadgeText({ text: '' });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId || !FORMATS[info.menuItemId.replace('save-', '')] || !info.srcUrl || !tab?.id) return;
  const format = info.menuItemId.replace('save-', '');
  await saveImage({ tabId: tab.id, srcUrl: info.srcUrl, format });
});

function removeAllContextMenus() {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.removeAll(() => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

function createContextMenu(properties) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.create(properties, () => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

async function saveImage({ tabId, srcUrl, format }) {
  const settings = await readSettings();
  try {
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId },
      func: convertImageInPage,
      args: [srcUrl, format, settings.quality]
    });
    const result = execution?.result;
    if (!result?.ok) throw new Error(result?.message || 'The image could not be converted.');

    const filename = buildFilename({
      sourceUrl: result.sourceUrl || srcUrl,
      pageTitle: result.pageTitle,
      format,
      filenameRule: settings.filenameRule
    });
    const downloadId = await chrome.downloads.download({
      url: result.dataUrl,
      filename,
      saveAs: false,
      conflictAction: 'uniquify'
    });

    if (settings.historyEnabled) {
      const nextSettings = mergeSettings({
        ...settings,
        recentSaves: [
          {
            id: crypto.randomUUID(),
            filename,
            format,
            domain: result.domain || 'web page',
            timestamp: Date.now(),
            bytes: result.bytes || 0,
            downloadId
          },
          ...settings.recentSaves
        ].slice(0, MAX_HISTORY_ITEMS)
      });
      await writeSettings(nextSettings);
    }

    await showStatus(tabId, `Saved ${filename}${result.isGif ? ' (first frame of animated GIF)' : ''}`, 'success');
  } catch (error) {
    const message = friendlyError(error);
    await showStatus(tabId, message, 'error');
  }
}

async function showStatus(tabId, message, kind) {
  await chrome.action.setBadgeText({ text: kind === 'success' ? 'OK' : '!' });
  await chrome.action.setBadgeBackgroundColor({ color: kind === 'success' ? '#22c55e' : '#ef4444' });
  await chrome.alarms.create(BADGE_CLEAR_ALARM, { delayInMinutes: 0.5 });
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: showPageToast,
      args: [message, kind]
    });
  } catch {
    // Pages such as chrome:// settings cannot accept injected feedback.
  }
}

function friendlyError(error) {
  const message = String(error?.message || error || 'The image could not be saved.');
  if (/Cannot access contents|The extensions gallery|(?:chrome|edge):\/\//i.test(message)) {
    return 'This page does not allow Safe Image Save to read the image.';
  }
  if (/cross-origin|taint|securityerror|blocked/i.test(message)) {
    return 'This image blocks local conversion. Try opening the image in a new tab first.';
  }
  return message.length > 140 ? 'The image could not be converted. Try a different format.' : message;
}

function showPageToast(message, kind) {
  const existing = document.querySelector('[data-safe-image-save-toast]');
  existing?.remove();
  const toast = document.createElement('div');
  toast.dataset.safeImageSaveToast = 'true';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: '2147483647',
    maxWidth: 'min(420px, calc(100vw - 40px))',
    padding: '12px 16px',
    borderRadius: '12px',
    background: kind === 'success' ? '#123521' : '#471b1b',
    color: '#f8fafc',
    border: `1px solid ${kind === 'success' ? '#22c55e' : '#ef4444'}`,
    boxShadow: '0 12px 30px rgba(0, 0, 0, .28)',
    font: '600 13px/1.4 system-ui, sans-serif'
  });
  document.documentElement.append(toast);
  window.setTimeout(() => toast.remove(), 5000);
}
