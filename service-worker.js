import {
  BADGE_CLEAR_ALARM,
  FORMATS,
  MAX_HISTORY_ITEMS,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS
} from './shared/constants.js';
import {
  buildFilename,
  isXImageUrl,
  mergeSettings,
  readSettings,
  writeSettings
} from './shared/utils.js';
import { convertImageInPage } from './shared/image-converter.js';
import { createContextMenuSetup } from './shared/context-menu-manager.js';

const MENU_PARENT_ID = 'safe-image-save';
const X_IMAGE_ORIGIN = 'https://pbs.twimg.com/*';
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

// Context menu entries persist across worker and browser restarts; rebuild only on install or update.
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install' && reason !== 'update') return;
  try {
    await setupContextMenus();
    const settings = await readSettings();
    await writeSettings(settings);
  } catch (error) {
    console.error('Safe Image Save could not finish installation setup.', error);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== BADGE_CLEAR_ALARM) return;
  await chrome.action.setBadgeText({ text: '' });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuItemId = typeof info.menuItemId === 'string' ? info.menuItemId : '';
  const format = menuItemId.startsWith('save-') ? menuItemId.slice('save-'.length) : '';
  if (!FORMATS[format] || !info.srcUrl || !tab?.id) return;

  // Request only the X image CDN permission, directly from the user's menu click.
  const permissionRequest = isXImageUrl(info.srcUrl)
    ? chrome.permissions.request({ origins: [X_IMAGE_ORIGIN] })
    : Promise.resolve(true);

  void handleImageMenuClick({ info, tab, format, permissionRequest });
});

async function handleImageMenuClick({ info, tab, format, permissionRequest }) {
  try {
    const permissionGranted = await permissionRequest;
    if (!permissionGranted) {
      await showStatus(
        tab.id,
        'Allow optional access to pbs.twimg.com to convert this X image locally. Nothing was downloaded.',
        'error'
      );
      return;
    }

    await saveImage({
      tabId: tab.id,
      srcUrl: info.srcUrl,
      format
    });
  } catch (error) {
    await showStatus(tab.id, friendlyError(error), 'error');
  }
}

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
  try {
    const settings = await readSettings();
    let result;
    if (isXImageUrl(srcUrl)) {
      const pageMetadata = await readPageMetadata(tabId).catch(() => ({}));
      result = await convertXImagePrivately({ srcUrl, format, quality: settings.quality, pageMetadata });
    } else {
      result = await convertImageInPageInTab({ tabId, srcUrl, format, quality: settings.quality });
    }
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

async function convertImageInPageInTab({ tabId, srcUrl, format, quality }) {
  const [execution] = await chrome.scripting.executeScript({
    target: { tabId },
    func: convertImageInPage,
    args: [srcUrl, format, quality]
  });
  return execution?.result;
}

async function readPageMetadata(tabId) {
  const [execution] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      pageTitle: document.title,
      domain: location.hostname.replace(/^www\./i, '')
    })
  });
  return execution?.result || {};
}

async function convertXImagePrivately({ srcUrl, format, quality, pageMetadata }) {
  const hasAccess = await chrome.permissions.contains({ origins: [X_IMAGE_ORIGIN] });
  if (!hasAccess) {
    throw new Error('Allow optional access to pbs.twimg.com to convert this X image locally. Nothing was downloaded.');
  }

  const config = FORMATS[format];
  const response = await fetch(srcUrl, {
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'no-referrer'
  });
  if (!response.ok) throw new Error('X did not return the selected image. Reload the page and try again.');
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new Error('This image is too large for safe local conversion.');
  }

  const sourceBlob = await response.blob();
  if (!sourceBlob.type.toLowerCase().startsWith('image/')) {
    throw new Error('X did not return a readable image. Reload the page and try again.');
  }
  if (!sourceBlob.size || sourceBlob.size > MAX_IMAGE_BYTES) {
    throw new Error('This image is empty or too large for safe local conversion.');
  }

  const bitmap = await createImageBitmap(sourceBlob);
  try {
    const { width, height } = bitmap;
    if (!width || !height || width * height > MAX_IMAGE_PIXELS) {
      throw new Error('This image is too large for safe local conversion.');
    }

    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d', { alpha: format !== 'jpg' });
    if (!context) throw new Error('Your browser could not create a conversion canvas.');
    if (format === 'jpg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(bitmap, 0, 0);

    const outputBlob = await canvas.convertToBlob({ type: config.mime, quality });
    if (outputBlob.type !== config.mime) {
      throw new Error(format === 'avif'
        ? 'AVIF encoding is not available in this browser yet.'
        : `This browser did not produce a valid ${format.toUpperCase()} file.`);
    }

    return {
      ok: true,
      dataUrl: await blobToDataUrl(outputBlob),
      bytes: outputBlob.size,
      sourceUrl: srcUrl,
      pageTitle: pageMetadata.pageTitle || '',
      domain: pageMetadata.domain || 'web page',
      isGif: sourceBlob.type.toLowerCase() === 'image/gif'
    };
  } finally {
    bitmap.close();
  }
}

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunkSize = 0x6000;
  const encodedChunks = [];
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    encodedChunks.push(btoa(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))));
  }
  return `data:${blob.type};base64,${encodedChunks.join('')}`;
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
