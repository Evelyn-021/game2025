export class ServiceLocator {
  static services = new Map();
  static register(name, service) { this.services.set(name, service); }
  static get(name) { return this.services.get(name); }
}
