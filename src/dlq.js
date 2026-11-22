export class DeadLetterQueue {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  add(event, error) {
    this.items.push({
      event,
      error: error.message,
      at: new Date().toISOString(),
    });
  }

  async replay(handler) {
    const remaining = [];

    for (const item of this.items) {
      try {
        await handler(item.event);
      } catch {
        remaining.push(item);
      }
    }

    this.items = remaining;
    return this.items.length;
  }

  list() {
    return [...this.items];
  }
}
