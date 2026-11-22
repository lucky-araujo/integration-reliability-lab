import test from 'node:test';
import assert from 'node:assert/strict';
import { DeadLetterQueue } from '../src/dlq.js';

test('replays an event and removes it from the queue', async () => {
  const dlq = new DeadLetterQueue();
  dlq.add({ id: 'evt_1' }, new Error('crm down'));

  const replayed = [];
  const remaining = await dlq.replay(async (event) => {
    replayed.push(event.id);
  });

  assert.deepEqual(replayed, ['evt_1']);
  assert.equal(remaining, 0);
  assert.equal(dlq.size, 0);
});

test('keeps the event in the queue when the replay fails', async () => {
  const dlq = new DeadLetterQueue();
  dlq.add({ id: 'evt_2' }, new Error('crm down'));

  const remaining = await dlq.replay(async () => {
    throw new Error('still down');
  });

  assert.equal(remaining, 1);
  assert.equal(dlq.size, 1);
  assert.equal(dlq.list()[0].event.id, 'evt_2');
});

test('replays the ones that succeed and keeps the ones that fail', async () => {
  const dlq = new DeadLetterQueue();
  dlq.add({ id: 'ok_1' }, new Error('x'));
  dlq.add({ id: 'fail_1' }, new Error('x'));
  dlq.add({ id: 'ok_2' }, new Error('x'));

  const remaining = await dlq.replay(async (event) => {
    if (event.id === 'fail_1') throw new Error('still down');
  });

  assert.equal(remaining, 1);
  assert.equal(dlq.size, 1);
  assert.equal(dlq.list()[0].event.id, 'fail_1');
});
