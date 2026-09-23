import assert from 'node:assert/strict';
import { createContextMenuSetup } from '../shared/context-menu-manager.js';

const menuItems = [
  { id: 'safe-image-save' },
  { id: 'save-png', parentId: 'safe-image-save' },
  { id: 'save-jpg', parentId: 'safe-image-save' },
  { id: 'save-webp', parentId: 'safe-image-save' },
  { id: 'save-avif', parentId: 'safe-image-save' }
];
const registered = new Map();
let removeCount = 0;
let createCount = 0;
let failNextCreate = false;

const setup = createContextMenuSetup({
  items: menuItems,
  async removeAll() {
    removeCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    registered.clear();
  },
  async create(item) {
    createCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 2));
    if (failNextCreate) {
      failNextCreate = false;
      throw new Error('simulated menu registration failure');
    }
    if (registered.has(item.id)) throw new Error(`Cannot create item with duplicate id ${item.id}`);
    registered.set(item.id, item);
  }
});

const [first, overlapping] = [setup(), setup()];
assert.equal(first, overlapping, 'overlapping install/startup events share one menu setup');
await Promise.all([first, overlapping, setup(), setup()]);
assert.equal(removeCount, 1, 'overlapping events clear existing menus once');
assert.equal(registered.size, menuItems.length);
assert.deepEqual([...registered.keys()], menuItems.map((item) => item.id));

await setup();
assert.equal(removeCount, 2, 'a later browser startup rebuilds the menus cleanly');
assert.equal(registered.size, menuItems.length);

failNextCreate = true;
await assert.rejects(setup(), /simulated menu registration failure/);
await setup();
assert.equal(registered.size, menuItems.length, 'a failed setup can be retried without retaining duplicate IDs');

console.log('Context-menu lifecycle checks passed.');
