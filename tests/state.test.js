import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, MAX_ENTRIES, MAX_POTATOES, readState, saveState, freshState, harvestPotato, addEntry } from '../docs/state.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('harvest and guestbook survive a storage round trip without losing either', () => {
  const storage = memoryStorage();
  let state = harvestPotato(harvestPotato(freshState()));
  state = addEntry(state, '  Fisher  ', '  Good old days.  ', new Date('2026-01-01T12:00:00Z'));
  assert.equal(saveState(storage, state), true);
  assert.deepEqual(readState(storage), {
    potatoes: 2,
    entries: [{ name: 'Fisher', message: 'Good old days.', date: '2026-01-01T12:00:00.000Z' }]
  });
  const updated = harvestPotato(readState(storage));
  assert.equal(updated.potatoes, 3);
  assert.equal(updated.entries[0].name, 'Fisher');
});

test('storage denial and invalid JSON do not break the page state', () => {
  const denied = { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Quota'); } };
  assert.deepEqual(readState(denied), freshState());
  assert.equal(saveState(denied, freshState()), false);
  assert.equal(saveState(null, freshState()), false);
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  assert.deepEqual(readState(storage), freshState());
});

test('restored state rejects malformed entries and clamps the count', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ potatoes: MAX_POTATOES + 5, entries: [null, {}, { name: 'X', message: 'Y', date: 'invalid' }, { name: 'A', message: 'B', date: '2026-01-01' }] }));
  const state = readState(storage);
  assert.equal(state.potatoes, MAX_POTATOES);
  assert.equal(state.entries.length, 1);
  for (const value of [-1, 1.5, '4', null]) {
    storage.setItem(STORAGE_KEY, JSON.stringify({ potatoes: value }));
    assert.equal(readState(storage).potatoes, 0);
  }
});

test('blank submissions are rejected, fields are bounded, newest 12 notes are retained', () => {
  assert.equal(addEntry(freshState(), '  ', 'Hi'), null);
  assert.equal(addEntry(freshState(), 'Me', '\n  '), null);
  let state = freshState();
  for (let i = 0; i < 15; i += 1) state = addEntry(state, `Player ${i}`, 'x'.repeat(300));
  assert.equal(state.entries.length, MAX_ENTRIES);
  assert.equal(state.entries[0].name, 'Player 14');
  assert.equal(state.entries.at(-1).name, 'Player 3');
  assert.equal(state.entries[0].message.length, 240);
  assert.equal(addEntry(state, 'a'.repeat(40), 'hi').entries[0].name.length, 24);
});

test('user markup is preserved as plain text data, without interpreting it', () => {
  const state = addEntry(freshState(), '<img src=x>', '<script>alert(1)</script>');
  assert.equal(state.entries[0].name, '<img src=x>');
  assert.equal(state.entries[0].message, '<script>alert(1)</script>');
});

test('harvesting is immutable and the barn count remains bounded', () => {
  const state = freshState();
  assert.equal(harvestPotato(state).potatoes, 1);
  assert.equal(state.potatoes, 0);
  assert.equal(harvestPotato({ potatoes: MAX_POTATOES, entries: [] }).potatoes, MAX_POTATOES);
});
