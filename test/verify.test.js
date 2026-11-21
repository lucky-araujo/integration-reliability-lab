import test from 'node:test';
import assert from 'node:assert/strict';
import { signBody, verifySignature } from '../src/verify.js';

const secret = 'test_secret';
const body = JSON.stringify({ id: 'evt_1', type: 'call.completed' });

test('accepts a signature generated with the same secret', () => {
  assert.equal(verifySignature(secret, body, signBody(secret, body)), true);
});

test('rejects a signature generated with another secret', () => {
  assert.equal(verifySignature(secret, body, signBody('other_secret', body)), false);
});

test('rejects a malformed signature', () => {
  assert.equal(verifySignature(secret, body, 'deadbeef'), false);
});
