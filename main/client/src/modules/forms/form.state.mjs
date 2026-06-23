export const formsStore = { state: {}, listeners: [], subscribe(cb) { this.listeners.push(cb); }, notify() { this.listeners.forEach(cb => cb(this.state)); } };
