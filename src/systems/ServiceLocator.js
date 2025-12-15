//Service Locator pattern
//Acceder a servicios compartidos (ejemplo: DamageSystem, AudioManager, FirebaseService)
export class ServiceLocator {
  static services = new Map();

  static register(name, service) {
    if (this.services.has(name)) {
      console.warn(`[ServiceLocator] Reemplazando servicio existente: ${name}`);
    }
    this.services.set(name, service);
  }

  static get(name) {
    const service = this.services.get(name);
    if (!service) {
      console.warn(`[ServiceLocator] Servicio no encontrado: ${name}`);
    }
    return service;
  }

  static clear() {
    this.services.clear();
  }
}
