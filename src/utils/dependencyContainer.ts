import { CiController } from "../controllers/CiController";
import { ICiService } from "../interfaces/ICiService";
import { ICiValidator } from "../interfaces/ICiValidator";
import { LoteriaUyCiService } from "../services/CiService";
import { UruguayanCiValidator } from "../validators/CiValidator";

/**
 * Contenedor de inyección de dependencias simple
 * Implementa el principio de Dependency Inversion
 */
export class DependencyContainer {
  private static instance: DependencyContainer;
  private ciValidator: ICiValidator;
  private ciService: ICiService;
  private ciController: CiController;

  private constructor() {
    // Crear instancias de las dependencias
    this.ciValidator = new UruguayanCiValidator();
    this.ciService = new LoteriaUyCiService();

    // Inyectar dependencias en el controlador
    this.ciController = new CiController(this.ciValidator, this.ciService);
  }

  /**
   * Obtiene la instancia singleton del contenedor
   */
  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  /**
   * Obtiene el validador de cédulas
   */
  getCiValidator(): ICiValidator {
    return this.ciValidator;
  }

  /**
   * Obtiene el servicio de consulta de cédulas
   */
  getCiService(): ICiService {
    return this.ciService;
  }

  /**
   * Obtiene el controlador de cédulas
   */
  getCiController(): CiController {
    return this.ciController;
  }

  /**
   * Permite reemplazar el validador (útil para testing)
   */
  setCiValidator(validator: ICiValidator): void {
    this.ciValidator = validator;
    this.ciController = new CiController(this.ciValidator, this.ciService);
  }

  /**
   * Permite reemplazar el servicio (útil para testing)
   */
  setCiService(service: ICiService): void {
    this.ciService = service;
    this.ciController = new CiController(this.ciValidator, this.ciService);
  }
}
