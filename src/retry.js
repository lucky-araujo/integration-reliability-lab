export async function withRetry(fn, { attempts = 3, baseDelayMs = 100 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        const delay = baseDelayMs * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}