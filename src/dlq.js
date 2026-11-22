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

  list() {
    return [...this.items];
  }
}
