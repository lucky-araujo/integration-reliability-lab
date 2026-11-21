export class InMemoryStore {
  constructor() {
    this.events = new Map();
  }

  get size() {
    return this.events.size;
  }

   add(id, payload) {
    if (this.events.has(id)) {
      return { duplicate: true, event: this.events.get(id) };
    }

    this.events.set(id, payload);
    return { duplicate: false, event: payload };
  }
}
