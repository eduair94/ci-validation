import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createCiRoutes } from './routes/ciRoutes';
import { ErrorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { DependencyContainer } from './utils/dependencyContainer';

/**
 * Configuración principal de la aplicación Express
 * Siguiendo principios SOLID y buenas prácticas de seguridad
 */
class App {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Configura middlewares de seguridad y utilidad
   */
  private initializeMiddlewares(): void {
    // Seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? true // Allow all origins for demo purposes
        : true,
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Serve static files from public directory
    const publicPath = path.join(__dirname, '../public');
    this.app.use(express.static(publicPath));

    // Parsing de body
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging básico
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configura las rutas de la aplicación
   */
  private initializeRoutes(): void {
    const container = DependencyContainer.getInstance();
    const ciController = container.getCiController();

    // Health check
    this.app.get('/health', async (req, res) => {
      await ciController.healthCheck(req, res);
    });

    // Rutas de la API
    this.app.use('/api/ci', createCiRoutes());

    // Demo page route
    this.app.get('/demo', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Ruta raíz con información básica
    this.app.get('/', (req, res) => {
      res.json({
        name: 'API de Validación de Cédulas Uruguayas',
        version: '1.0.0',
        description: 'API para validar cédulas de identidad uruguayas',
        endpoints: {
          health: 'GET /health',
          validate: 'POST /api/ci/validate',
          demo: 'GET /api/ci/demo',
          demoPage: 'GET /demo'
        },
        documentation: 'Ver README.md para más información',
        demoUrl: '/demo'
      });
    });
  }

  /**
   * Configura el manejo de errores
   */
  private initializeErrorHandling(): void {
    // Middleware para rutas no encontradas
    this.app.use(ErrorHandler.notFoundHandler);
    
    // Middleware para errores globales
    this.app.use(ErrorHandler.globalErrorHandler);
  }

  /**
   * Inicia el servidor
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
      console.log(`📋 Health check: http://localhost:${this.port}/health`);
      console.log(`🔍 Demo: http://localhost:${this.port}/api/ci/demo`);
      console.log(`📖 Documentación: Ver README.md`);
    });
  }

  /**
   * Obtiene la instancia de Express (útil para testing)
   */
  public getApp(): Application {
    return this.app;
  }
}

// Crear e iniciar la aplicación
const app = new App();

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Exportar para uso en testing o deployment
export default app;

// Iniciar servidor solo si este archivo es ejecutado directamente
if (require.main === module) {
  app.start();
}
