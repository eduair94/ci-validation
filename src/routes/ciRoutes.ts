import { Router } from "express";
import { DependencyContainer } from "../utils/dependencyContainer";

/**
 * Rutas para endpoints relacionados con cédulas de identidad
 */
export function createCiRoutes(): Router {
  const router = Router();
  const container = DependencyContainer.getInstance();
  const ciController = container.getCiController();

  /**
   * POST /api/ci/validate
   * Valida una cédula de identidad uruguaya
   */
  router.post("/validate", async (req, res) => {
    await ciController.validateCi(req, res);
  });

  /**
   * GET /api/ci/validate?ci=xxx
   * Valida una cédula de identidad uruguaya mediante query parameter
   */
  router.get("/validate", async (req, res) => {
    await ciController.validateCiQuery(req, res);
  });

  /**
   * GET /api/ci/demo
   * Endpoint de demostración con cédula de ejemplo
   */
  router.get("/demo", async (req, res) => {
    await ciController.demo(req, res);
  });

  /**
   * POST /api/ci/smi
   * Consulta información específica de SMI por cédula
   */
  router.post("/smi", async (req, res) => {
    // Start timing
    const startTime = Date.now();

    try {
      const { SmiService } = await import("../services/Smi");
      const { UruguayanCiValidator } = await import("../validators/CiValidator");

      const { ci } = req.body;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        return res.status(400).json({
          success: false,
          error: 'El campo "ci" es requerido',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        });
      }

      // Start validation timing
      const validationStartTime = Date.now();
      const ciValidator = new UruguayanCiValidator();

      // Validar formato básico
      if (!ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // Validar cédula completa
      const isValid = ciValidator.validate(ci);
      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Consultar información de SMI
      const normalizedCi = ciValidator.normalize(ci);
      const smiService = new SmiService();
      const smiResult = await smiService.checkUser({ ci: normalizedCi });

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: smiResult,
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      });
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      console.error("Error en endpoint SMI:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor al consultar SMI",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      });
    }
  });

  /**
   * GET /api/ci/smi?ci=xxx
   * Consulta información específica de SMI por cédula (query parameter)
   */
  router.get("/smi", async (req, res) => {
    // Start timing
    const startTime = Date.now();

    try {
      const { SmiService } = await import("../services/Smi");
      const { UruguayanCiValidator } = await import("../validators/CiValidator");

      const ci = req.query.ci as string;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        return res.status(400).json({
          success: false,
          error: 'El parámetro "ci" es requerido en la query string',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        });
      }

      // Start validation timing
      const validationStartTime = Date.now();
      const ciValidator = new UruguayanCiValidator();

      // Validar formato básico
      if (!ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // Validar cédula completa
      const isValid = ciValidator.validate(ci);
      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Consultar información de SMI
      const normalizedCi = ciValidator.normalize(ci);
      const smiService = new SmiService();
      const smiResult = await smiService.checkUser({ ci: normalizedCi });

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: smiResult,
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      });
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      console.error("Error en endpoint SMI:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor al consultar SMI",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      });
    }
  });

  /**
   * POST /api/ci/validate-new
   * Valida una cédula usando el nuevo servicio MEF con timing
   */
  router.post("/validate-new", async (req, res) => {
    // Start timing
    const startTime = Date.now();

    try {
      const { NewCiService } = await import("../services/NewCiService");
      const { UruguayanCiValidator } = await import("../validators/CiValidator");

      const { ci } = req.body;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        return res.status(400).json({
          success: false,
          error: 'El campo "ci" es requerido',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        });
      }

      // Start validation timing
      const validationStartTime = Date.now();
      const ciValidator = new UruguayanCiValidator();

      // Validar formato básico
      if (!ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // Validar cédula completa
      const isValid = ciValidator.validate(ci);
      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Consultar con el nuevo servicio
      const normalizedCi = ciValidator.normalize(ci);
      const newCiService = new NewCiService();
      const result = await newCiService.check(normalizedCi);

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: {
          ci: ci,
          isValid: true,
          normalizedCi: normalizedCi,
          info: result,
        },
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      });
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      console.error("Error en validate-new:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      });
    }
  });

  /**
   * GET /api/ci/validate-new?ci=xxx
   * Valida una cédula usando el nuevo servicio MEF con timing (query parameter)
   */
  router.get("/validate-new", async (req, res) => {
    // Start timing
    const startTime = Date.now();

    try {
      const { NewCiService } = await import("../services/NewCiService");
      const { UruguayanCiValidator } = await import("../validators/CiValidator");

      const ci = req.query.ci as string;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        return res.status(400).json({
          success: false,
          error: 'El parámetro "ci" es requerido en la query string',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        });
      }

      // Start validation timing
      const validationStartTime = Date.now();
      const ciValidator = new UruguayanCiValidator();

      // Validar formato básico
      if (!ciValidator.validateFormat(ci)) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // Validar cédula completa
      const isValid = ciValidator.validate(ci);
      if (!isValid) {
        const executionTime = Date.now() - startTime;
        const validationTime = Date.now() - validationStartTime;
        return res.status(400).json({
          success: false,
          error: "Cédula inválida: dígito verificador incorrecto",
          code: "INVALID_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: validationTime,
          },
        });
      }

      // End validation timing, start query timing
      const validationTime = Date.now() - validationStartTime;
      const queryStartTime = Date.now();

      // Consultar con el nuevo servicio
      const normalizedCi = ciValidator.normalize(ci);
      const newCiService = new NewCiService();
      const result = await newCiService.check(normalizedCi);

      // End query timing
      const queryTime = Date.now() - queryStartTime;
      const totalExecutionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: {
          ci: ci,
          isValid: true,
          normalizedCi: normalizedCi,
          info: result,
        },
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: validationTime,
          query: queryTime,
        },
      });
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      console.error("Error en validate-new:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: totalExecutionTime,
          validation: 0,
        },
      });
    }
  });

  return router;
}
