import test from 'node:test';
import assert from 'node:assert/strict';
import { withRetry } from '../src/retry.js';

test('returns the result when the function succeeds', async () => {
  const result = await withRetry(async () => 'ok', { attempts: 3, baseDelayMs: 1 });
  assert.equal(result, 'ok');
});

test('retries until the function succeeds', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    if (calls < 3) throw new Error('temporary');
    return 'ok';
  }, { attempts: 3, baseDelayMs: 1 });

  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

test('gives up after the attempts and throws the last error', async () => {
  let calls = 0;

  await assert.rejects(
    () => withRetry(async () => {
      calls++;
      throw new Error(`fail ${calls}`);
    }, { attempts: 3, baseDelayMs: 1 }),
    /fail 3/
  );

  assert.equal(calls, 3);
});
