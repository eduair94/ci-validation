import { Router } from 'express';
import { DependencyContainer } from '../utils/dependencyContainer';

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
  router.post('/validate', async (req, res) => {
    await ciController.validateCi(req, res);
  });

  /**
   * GET /api/ci/demo
   * Endpoint de demostración con cédula de ejemplo
   */
  router.get('/demo', async (req, res) => {
    await ciController.demo(req, res);
  });

  return router;
}
