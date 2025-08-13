import test from 'node:test';
import assert from 'node:assert/strict';
import { loadUniverse } from './universe.js';
import { handleCommand, initialState } from './game.js';

const setup = async () => {
  const universe = await loadUniverse();
  let state = initialState(universe);
  return { universe, state };
};

test('look shows room description', async () => {
  const { universe, state } = await setup();
  const [output] = handleCommand(universe, state, 'look');
  assert.ok(output.includes('Forest Clearing'));
  assert.ok(output.includes('Items: stone'));
});

test('move changes room', async () => {
  const { universe, state } = await setup();
  const [, newState] = handleCommand(universe, state, 'move north');
  assert.equal(newState.roomId, 'forest_path');
});

test('take and drop items', async () => {
  const { universe, state } = await setup();
  const [, s1] = handleCommand(universe, state, 'take stone');
  assert.deepEqual(s1.inventory, ['stone']);
  const [msg, s2] = handleCommand(universe, s1, 'drop stone');
  assert.ok(msg.includes('drop the stone'));
  assert.deepEqual(s2.inventory, []);
});
