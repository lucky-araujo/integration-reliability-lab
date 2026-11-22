import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { signBody } from '../src/verify.js';

const secret = 'test_secret';

async function start(processEvent) {
  const server = createServer({ secret, processEvent });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}` };
}

async function post(url, body) {
  return fetch(`${url}/webhooks/test`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': signBody(secret, body),
    },
    body,
  });
}

test('retries the processor and returns 200 when it eventually succeeds', async () => {
  let calls = 0;

  const { server, url } = await start(async () => {
    calls++;
    if (calls === 1) throw new Error('temporary');
  });

  try {
    const body = JSON.stringify({ id: 'evt_retry' });
    const res = await post(url, body);

    assert.equal(res.status, 200);
    assert.equal(calls, 2);
    assert.equal(server.dlq.size, 0);
  } finally {
    server.close();
  }
});

test('sends the event to the DLQ after the attempts', async () => {
  const { server, url } = await start(async () => {
    throw new Error('crm down');
  });

  try {
    const body = JSON.stringify({ id: 'evt_dlq' });
    const res = await post(url, body);

    assert.equal(res.status, 202);
    const json = await res.json();
    assert.equal(json.queued, true);
    assert.equal(server.dlq.size, 1);
  } finally {
    server.close();
  }
});
