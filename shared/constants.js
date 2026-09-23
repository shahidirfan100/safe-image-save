export const SETTINGS_KEY = 'settings';
export const BADGE_CLEAR_ALARM = 'clear-status-badge';
export const MAX_HISTORY_ITEMS = 8;

export const FORMATS = {
  png: { label: 'PNG', extension: 'png', mime: 'image/png', lossy: false },
  jpg: { label: 'JPG', extension: 'jpg', mime: 'image/jpeg', lossy: true },
  webp: { label: 'WebP', extension: 'webp', mime: 'image/webp', lossy: true },
  avif: { label: 'AVIF', extension: 'avif', mime: 'image/avif', lossy: true }
};

export const FORMAT_ORDER = ['png', 'jpg', 'webp', 'avif'];

export const DEFAULT_SETTINGS = {
  defaultFormat: 'png',
  quality: 0.9,
  filenameRule: 'original',
  historyEnabled: true,
  recentSaves: []
};

export const SOURCE_REPOSITORY_URL = 'https://github.com/shahidirfan100/safe-image-save';
