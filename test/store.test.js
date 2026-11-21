import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryStore } from '../src/store.js';

test('stores a new event', () => {
  const store = new InMemoryStore();
  const result = store.add('evt_1', { id: 'evt_1' });

  assert.equal(result.duplicate, false);
  assert.equal(store.size, 1);
});

test('does not store the same event twice', () => {
  const store = new InMemoryStore();
  store.add('evt_1', { id: 'evt_1', type: 'first' });
  const result = store.add('evt_1', { id: 'evt_1', type: 'second' });

  assert.equal(result.duplicate, true);
  assert.equal(store.size, 1);
  assert.equal(store.events.get('evt_1').type, 'first');
});

test('stores different events separately', () => {
  const store = new InMemoryStore();
  store.add('evt_1', { id: 'evt_1' });
  const result = store.add('evt_2', { id: 'evt_2' });

  assert.equal(result.duplicate, false);
  assert.equal(store.size, 2);
});
