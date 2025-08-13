import test from 'node:test';
import assert from 'node:assert/strict';
import { loadUniverse } from './universe.js';

test('loads regions and validates item and NPC references', async () => {
  const universe = await loadUniverse();
  const region = universe.worlds.earth.realms.gaia.lands.greenfield.regions.beginner_forest;
  assert.equal(region.rooms.length, 2);
  for (const room of region.rooms) {
    for (const itemId of room.items || []) {
      assert.ok(universe.items[itemId], `Item ${itemId} should exist`);
    }
    for (const npcId of room.npcs || []) {
      assert.ok(universe.npcs[npcId], `NPC ${npcId} should exist`);
    }
  }
  assert.equal(universe.rollPrompts.length, 3);
  assert.ok(universe.introText.includes('Welcome'));
});
