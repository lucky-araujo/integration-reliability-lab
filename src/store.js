export class InMemoryStore {
  constructor() {
    this.events = new Map();
  }

  get size() {
    return this.events.size;
  }

  add(id, payload) {
    this.events.set(id, payload);
    return { duplicate: false, event: payload };
  }
}