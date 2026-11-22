import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

test('replays the DLQ over HTTP and returns the remaining count', async () => {
  const server = createServer({ secret: 'test_secret' });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    server.dlq.add({ id: 'evt_1' }, new Error('crm down'));

    const res = await fetch(`http://127.0.0.1:${port}/dlq/replay`, { method: 'POST' });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.remaining, 0);
    assert.equal(server.dlq.size, 0);
  } finally {
    server.close();
  }
});
