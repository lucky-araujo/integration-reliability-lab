import http from 'node:http';
import { verifySignature } from './verify.js';
import { InMemoryStore } from './store.js';
import { withRetry } from './retry.js';
import { DeadLetterQueue } from './dlq.js';

export function createServer({ secret, processEvent = async () => {} }) {
  const store = new InMemoryStore();
  const dlq = new DeadLetterQueue();

  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || !req.url.startsWith('/webhooks/')) {
      res.writeHead(404).end();
      return;
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');

    const signature = req.headers['x-signature'];
    if (!signature || !verifySignature(secret, raw, signature)) {
      res.writeHead(401, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid signature' }));
      return;
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid json' }));
      return;
    }

    if (!payload || typeof payload.id !== 'string') {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'missing id' }));
      return;
    }

    const result = store.add(payload.id, payload);

    if (result.duplicate) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ received: true, duplicate: true }));
      return;
    }

    try {
      await withRetry(() => processEvent(payload), { attempts: 3, baseDelayMs: 10 });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ received: true, duplicate: false }));
    } catch (error) {
      dlq.add(payload, error);
      res.writeHead(202, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ received: true, duplicate: false, queued: true }));
    }
  });

  server.store = store;
  server.dlq = dlq;
  return server;
}
