# integration-reliability-lab

A small webhook receiver that validates the signature, processes each event once, and does not lose the event when the downstream call fails.

## What it does

- `POST /webhooks/:source` receives a JSON event.
- Checks `x-signature`, an HMAC SHA256 of the raw body using `WEBHOOK_SECRET`.
- Stores the event by `id` and ignores duplicates.
- Processes the event with up to 3 attempts and exponential backoff.
- Sends the event to a dead-letter queue when all attempts fail.

## Responses

| Status | When |
|---|---|
| 200 | Signature valid, event processed or already seen |
| 202 | Signature valid, processing failed, event queued in the DLQ |
| 400 | Invalid JSON or missing `id` |
| 401 | Missing or invalid signature |

## Run the tests

```bash
node --test
```

16 tests: signature, store, retry, DLQ and the HTTP flow.

## Design notes

- The signature is checked against the raw body, before `JSON.parse`.
- The store marks the event before processing. A provider retry after a failure is treated as a duplicate, so the recovery path is the DLQ replay, not another webhook.
- `baseDelayMs` is small in tests and should be larger in production.

## Next steps

- Add a replay command for the DLQ.
- Replace the in-memory store with PostgreSQL.
- Add structured logs and tracing.
