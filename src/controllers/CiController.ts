import { Request, Response } from 'express';
import { ICiValidator } from '../interfaces/ICiValidator';
import { ICiService } from '../interfaces/ICiService';
import { 
  ApiResponse, 
  CiValidationData, 
  CiValidationRequest, 
  HealthCheckResponse 
} from '../interfaces/ApiResponse';

export class CiController {
  constructor(
    private readonly ciValidator: ICiValidator,
    private readonly ciService: ICiService
  ) {}

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthResponse: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      };

      res.status(200).json(healthResponse);
    } catch (error) {
      const errorResponse: HealthCheckResponse = {
        status: 'error',
        timestamp: new Date().toISOString()
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Valida una cédula de identidad uruguaya
   */
  async validateCi(req: Request, res: Response): Promise<void> {
    try {
      const { ci }: CiValidationRequest = req.body;

      if (!ci) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'El campo "ci" es requerido',
          code: 'MISSING_CI',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validar formato básico
      if (!this.ciValidator.validateFormat(ci)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos',
          code: 'INVALID_FORMAT',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validar cédula completa
      const isValid = this.ciValidator.validate(ci);
      
      if (!isValid) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Cédula inválida: dígito verificador incorrecto',
          code: 'INVALID_CI',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Si es válida, consultar información
      const normalizedCi = this.ciValidator.normalize(ci);
      const queryResult = await this.ciService.queryCiInfo(normalizedCi);

      const validationData: CiValidationData = {
        ci: ci,
        isValid: true,
        normalizedCi: normalizedCi,
        info: queryResult.success ? queryResult.data : queryResult.error
      };

      const response: ApiResponse<CiValidationData> = {
        success: true,
        data: validationData,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
      
      console.error('Error en validateCi:', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Endpoint de demostración con una cédula de ejemplo
   */
  async demo(req: Request, res: Response): Promise<void> {
    try {
      // Cédula de ejemplo válida (esta es ficticia pero con formato correcto)
      const demoCi = '47073450';
      
      const isValid = this.ciValidator.validate(demoCi);
      const normalizedCi = this.ciValidator.normalize(demoCi);

      let info = 'Cédula de demostración - Sin consulta real al servicio';
      
      // Si la cédula es válida, podemos intentar la consulta real
      if (isValid) {
        const queryResult = await this.ciService.queryCiInfo(normalizedCi);
        if (queryResult.success) {
          info = queryResult.data || info;
        }
      }

      const validationData: CiValidationData = {
        ci: demoCi,
        isValid: isValid,
        normalizedCi: normalizedCi,
        info: info
      };

      const response: ApiResponse<CiValidationData> = {
        success: true,
        data: validationData,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Error en el endpoint de demostración',
        code: 'DEMO_ERROR',
        timestamp: new Date().toISOString()
      };
      
      console.error('Error en demo:', error);
      res.status(500).json(errorResponse);
    }
  }
}
