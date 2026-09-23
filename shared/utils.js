import { DEFAULT_SETTINGS, FORMATS, MAX_HISTORY_ITEMS, SETTINGS_KEY } from './constants.js';

export function mergeSettings(value = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...value };
  if (!FORMATS[merged.defaultFormat]) merged.defaultFormat = DEFAULT_SETTINGS.defaultFormat;
  if (!Number.isFinite(merged.quality)) merged.quality = DEFAULT_SETTINGS.quality;
  merged.quality = Math.min(1, Math.max(0.1, merged.quality));
  if (!['original', 'page-title', 'hostname-date'].includes(merged.filenameRule)) {
    merged.filenameRule = DEFAULT_SETTINGS.filenameRule;
  }
  merged.historyEnabled = merged.historyEnabled !== false;
  merged.recentSaves = Array.isArray(merged.recentSaves)
    ? merged.recentSaves.slice(0, MAX_HISTORY_ITEMS)
    : [];
  return merged;
}

export async function readSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return mergeSettings(stored[SETTINGS_KEY]);
}

export async function writeSettings(settings) {
  const normalized = mergeSettings(settings);
  await chrome.storage.local.set({ [SETTINGS_KEY]: normalized });
  return normalized;
}

export function sanitizeFilename(value, fallback = 'image') {
  const cleaned = String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/[. ]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || fallback).slice(0, 96);
}

export function sourceBaseName(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    const lastSegment = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    return sanitizeFilename(lastSegment.replace(/\.[a-z0-9]{1,8}$/i, ''), 'image');
  } catch {
    return 'image';
  }
}

export function hostnameFromUrl(sourceUrl) {
  try {
    return sanitizeFilename(new URL(sourceUrl).hostname.replace(/^www\./i, ''), 'image');
  } catch {
    return 'image';
  }
}

export function buildFilename({ sourceUrl, pageTitle, format, filenameRule, now = new Date() }) {
  const date = now.toISOString().slice(0, 10);
  let base = sourceBaseName(sourceUrl);
  if (filenameRule === 'page-title') base = sanitizeFilename(pageTitle, base);
  if (filenameRule === 'hostname-date') base = `${hostnameFromUrl(sourceUrl)}-${date}`;
  return `${base}.${FORMATS[format].extension}`;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1) return 'Ready';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(timestamp) {
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp);
  } catch {
    return '';
  }
}
