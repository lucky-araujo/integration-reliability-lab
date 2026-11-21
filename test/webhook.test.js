import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { signBody } from '../src/verify.js';

const secret = 'test_secret';

async function start() {
  const server = createServer({ secret });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}` };
}

async function post(url, body, signature) {
  return fetch(`${url}/webhooks/test`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(signature ? { 'x-signature': signature } : {}),
    },
    body,
  });
}

test('accepts a valid signature and stores the event', async () => {
  const { server, url } = await start();
  try {
    const body = JSON.stringify({ id: 'evt_1', type: 'call.completed' });
    const res = await post(url, body, signBody(secret, body));

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.received, true);
    assert.equal(json.duplicate, false);
    assert.equal(server.store.size, 1);
  } finally {
    server.close();
  }
});

test('rejects an invalid signature', async () => {
  const { server, url } = await start();
  try {
    const body = JSON.stringify({ id: 'evt_2' });
    const res = await post(url, body, 'deadbeef');

    assert.equal(res.status, 401);
    assert.equal(server.store.size, 0);
  } finally {
    server.close();
  }
});

test('does not store the same event twice', async () => {
  const { server, url } = await start();
  try {
    const body = JSON.stringify({ id: 'evt_3' });
    const signature = signBody(secret, body);

    const first = await post(url, body, signature);
    const second = await post(url, body, signature);

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal((await first.json()).duplicate, false);
    assert.equal((await second.json()).duplicate, true);
    assert.equal(server.store.size, 1);
  } finally {
    server.close();
  }
});
