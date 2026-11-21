# integration-reliability-lab

A small webhook receiver that validates the signature and processes each event once.

## What it does

- `POST /webhooks/:source` receives a JSON event.
- It checks `x-signature`, an HMAC SHA256 of the raw body using `WEBHOOK_SECRET`.
- It stores the event by `id` and ignores duplicates.
- It returns `401` when the signature is wrong.

## Run the tests

```bash
node --test
```

The three tests start red. The goal is to implement three functions until they pass:

1. `verifySignature` in `src/verify.js`.
2. `InMemoryStore.add` in `src/store.js`.
3. `createServer` in `src/server.js`.

## Why this exists

Webhooks fail in silence. This lab is the smallest piece of the reliability work: prove the caller is who they say they are, and never process the same event twice.

## Next steps

- Add retries with exponential backoff.
- Add a dead-letter queue and a replay command.
- Add structured logs and tracing.
