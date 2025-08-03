import { Request, Response } from "express";
import { ApiResponse, CiValidationData, CiValidationRequest, HealthCheckResponse } from "../interfaces/ApiResponse";
import { ICiService } from "../interfaces/ICiService";
import { ICiValidator } from "../interfaces/ICiValidator";

export class CiController {
  constructor(private readonly ciValidator: ICiValidator, private readonly ciService: ICiService) {}

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthResponse: HealthCheckResponse = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
      };

      res.status(200).json(healthResponse);
    } catch (error) {
      const errorResponse: HealthCheckResponse = {
        status: "error",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Valida una cédula de identidad uruguaya
   */
  async validateCi(req: Request, res: Response): Promise<void> {
    // Start timing
    const startTime = Date.now();

    try {
      const { ci }: CiValidationRequest = req.body;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: 'El campo "ci" es requerido',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Start validation timing
      const validationStartTime = Date.now();

      // Validar formato básico
      if (!this.ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validar cédula completa
      const isValid = this.ciValidator.validate(ci);

      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Si es válida, consultar información
      const normalizedCi = this.ciValidator.normalize(ci);
      const queryResult = await this.ciService.queryCiInfo(normalizedCi);

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      const validationData: CiValidationData = {
        ci: ci,
        isValid: true,
        normalizedCi: normalizedCi,
        info: queryResult.success ? queryResult.data : queryResult.error,
      };

      const response: ApiResponse<CiValidationData> = {
        success: true,
        data: validationData,
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      const errorResponse: ApiResponse = {
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      };

      console.error("Error en validateCi:", error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Valida una cédula de identidad uruguaya mediante query parameter
   */
  async validateCiQuery(req: Request, res: Response): Promise<void> {
    // Start timing
    const startTime = Date.now();

    try {
      const ci = req.query.ci as string;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: 'El parámetro "ci" es requerido en la query string',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Start validation timing
      const validationStartTime = Date.now();

      // Validar formato básico
      if (!this.ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validar cédula completa
      const isValid = this.ciValidator.validate(ci);

      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Si es válida, consultar información
      const normalizedCi = this.ciValidator.normalize(ci);
      const queryResult = await this.ciService.queryCiInfo(normalizedCi);

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      const validationData: CiValidationData = {
        ci: ci,
        isValid: true,
        normalizedCi: normalizedCi,
        info: queryResult.success ? queryResult.data : queryResult.error,
      };

      const response: ApiResponse<CiValidationData> = {
        success: true,
        data: validationData,
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      const errorResponse: ApiResponse = {
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      };

      console.error("Error en validateCiQuery:", error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Endpoint de demostración con una cédula de ejemplo
   */
  async demo(req: Request, res: Response): Promise<void> {
    try {
      // Cédula de ejemplo válida (esta es ficticia pero con formato correcto)
      const demoCi = "19119365";

      const isValid = this.ciValidator.validate(demoCi);
      const normalizedCi = this.ciValidator.normalize(demoCi);

      let info: CiValidationData["info"] = "Cédula de demostración - Sin consulta real al servicio";

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
        info: info,
      };

      const response: ApiResponse<CiValidationData> = {
        success: true,
        data: validationData,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Error en el endpoint de demostración",
        code: "DEMO_ERROR",
        timestamp: new Date().toISOString(),
      };

      console.error("Error en demo:", error);
      res.status(500).json(errorResponse);
    }
  }
}
