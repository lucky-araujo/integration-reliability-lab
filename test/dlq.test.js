import test from 'node:test';
import assert from 'node:assert/strict';
import { DeadLetterQueue } from '../src/dlq.js';

test('starts empty', () => {
  const dlq = new DeadLetterQueue();
  assert.equal(dlq.size, 0);
});

test('stores a failed event with the error message', () => {
  const dlq = new DeadLetterQueue();
  dlq.add({ id: 'evt_1' }, new Error('crm down'));

  assert.equal(dlq.size, 1);
  assert.equal(dlq.list()[0].event.id, 'evt_1');
  assert.equal(dlq.list()[0].error, 'crm down');
});
