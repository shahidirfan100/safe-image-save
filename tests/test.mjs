import assert from 'node:assert/strict';
import { buildFilename, isXImageUrl, mergeSettings, sanitizeFilename, sourceBaseName } from '../shared/utils.js';

assert.equal(sanitizeFilename(' a<>:"/\\|?*  '), 'a---------');
assert.equal(sourceBaseName('https://example.com/assets/hero-image.webp?width=1200'), 'hero-image');
assert.equal(sourceBaseName('not a url'), 'image');
assert.equal(isXImageUrl('https://pbs.twimg.com/media/photo?format=jpg&name=large'), true);
assert.equal(isXImageUrl('https://pbs.twimg.com.evil.example/media/photo'), false);
assert.equal(isXImageUrl('http://pbs.twimg.com/media/photo?format=jpg'), false);
assert.equal(isXImageUrl('https://x.com/media/photo'), false);

const normalized = mergeSettings({
  defaultFormat: 'nope',
  quality: 12,
  filenameRule: 'nope',
  historyEnabled: false,
  recentSaves: 'not an array'
});
assert.equal(normalized.defaultFormat, 'png');
assert.equal(normalized.quality, 1);
assert.equal(normalized.filenameRule, 'original');
assert.equal(normalized.historyEnabled, false);
assert.deepEqual(normalized.recentSaves, []);

assert.equal(buildFilename({
  sourceUrl: 'https://example.com/assets/hero-image.webp',
  pageTitle: 'A useful page: notes',
  format: 'jpg',
  filenameRule: 'original'
}), 'hero-image.jpg');
assert.equal(buildFilename({
  sourceUrl: 'https://example.com/assets/hero-image.webp',
  pageTitle: 'A useful page: notes',
  format: 'png',
  filenameRule: 'page-title'
}), 'A useful page- notes.png');
assert.equal(buildFilename({
  sourceUrl: 'https://www.example.com/assets/hero-image.webp',
  pageTitle: 'A useful page',
  format: 'webp',
  filenameRule: 'hostname-date',
  now: new Date('2026-09-22T12:00:00Z')
}), 'example.com-2026-09-22.webp');

console.log('Unit checks passed.');
