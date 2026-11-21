import { createHmac, timingSafeEqual } from 'node:crypto';

export function signBody(secret, body) {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export function verifySignature(secret, body, signature) {
  const expected = createHmac('sha256', secret).update(body).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}