import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

assert.equal(manifest.manifest_version, 3);
assert.ok(!manifest.host_permissions, 'The MVP must not request host permissions.');
assert.ok(!manifest.content_scripts, 'The MVP must not install an always-on content script.');
for (const file of Object.values(manifest.icons)) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing manifest icon: ${file}`);
}
for (const file of ['service-worker.js', 'shared/constants.js', 'shared/utils.js', 'shared/image-converter.js', 'shared/context-menu-manager.js', 'popup/popup.js']) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing source file: ${file}`);
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
}

const requiredPermissions = ['activeTab', 'scripting', 'contextMenus', 'downloads', 'storage', 'alarms'];
assert.deepEqual(manifest.permissions, requiredPermissions);
const converter = fs.readFileSync(path.join(root, 'shared/image-converter.js'), 'utf8');
assert.match(converter, /canvas\.toBlob/);
assert.match(converter, /blob\.type !== config\.mime/);
assert.match(fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8'), /Local only/);

for (const [size, file] of Object.entries(manifest.icons)) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file} is not a PNG`);
  assert.equal(bytes.readUInt32BE(16), Number(size), `${file} width is wrong`);
  assert.equal(bytes.readUInt32BE(20), Number(size), `${file} height is wrong`);
}

function pngSize(file) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file} is not a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

for (const file of [
  'store-assets/screenshot-01-right-click-flow-1280x800.png',
  'store-assets/screenshot-02-settings-1280x800.png',
  'store-assets/screenshot-03-privacy-1280x800.png'
]) {
  assert.deepEqual(pngSize(file), { width: 1280, height: 800 }, `${file} has the wrong store screenshot size`);
}
assert.deepEqual(pngSize('store-assets/promo-small-440x280.png'), { width: 440, height: 280 });
assert.deepEqual(pngSize('store-assets/promo-marquee-1400x560.png'), { width: 1400, height: 560 });
assert.match(fs.readFileSync(path.join(root, 'store-assets/safe-image-save-logo.svg'), 'utf8'), /Safe Image Save logo/);

console.log('Manifest, syntax, permission, and icon checks passed.');
