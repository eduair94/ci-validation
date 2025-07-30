# API de Validación de Cédulas Uruguayas

## 🚨 ALERTA DE SEGURIDAD PÚBLICA 🚨

> ### ⚠️ **IMPORTANTE PARA TODOS LOS URUGUAYOS** ⚠️
> 
> **Este proyecto fue desarrollado y hecho público debido a:**
> 
> 🔴 **FALTA DE INCENTIVOS MONETARIOS** para reportes de seguridad en entes públicos  
> 🔴 **AUSENCIA DE PROGRAMAS DE BUG BOUNTY** gubernamentales  
> 🔴 **NULA RESPUESTA** a reportes responsables de vulnerabilidades  
> 🔴 **FALTA DE ACCIONES CORRECTIVAS** ante problemas de seguridad reportados  
> 
> **🎯 OBJETIVO**: Concientizar a los ciudadanos uruguayos sobre lo **POCO CUIDADO** que está el sistema informático de los entes públicos, donde la información personal de todos nosotros está expuesta sin protección adecuada.
>
> **📋 Este trabajo se hace público para:**
> - Generar presión social para que se solucionen estos problemas
> - Mostrar la realidad del estado de la ciberseguridad pública
> - Educar sobre la importancia de proteger datos personales
> - Exigir transparencia y responsabilidad en la gestión de sistemas públicos
>
> Lee el [**📄 Reporte Completo de Vulnerabilidad**](./SECURITY_VULNERABILITY.md) para entender la gravedad del problema.

---

> ⚠️ **CONTEXTO**: Este proyecto fue desarrollado tras descubrir una vulnerabilidad de seguridad en servicios gubernamentales. Lee el [**Reporte de Vulnerabilidad**](./SECURITY_VULNERABILITY.md) para más información.

Una API RESTful construida con TypeScript y Express siguiendo los principios SOLID para validar cédulas de identidad uruguayas y consultar información a través del servicio oficial de la Lotería Nacional.

## 📦 Paquete NPM Disponible

**¡Esta funcionalidad también está disponible como paquete npm!**

```bash
# Instalar el paquete
npm install ci-validation

# Uso básico
import { validateCIAndQuery } from 'ci-validation';
console.log(validateCIAndQuery('19119365')); // true
```

🔗 **Enlaces del paquete**:
- **npm**: https://www.npmjs.com/package/ci-validation
- **Documentación completa**: [NPM_README.md](./NPM_README.md)
- **Guía de publicación**: [NPM_PUBLISHING.md](./NPM_PUBLISHING.md)

## 🚀 Características

- **📦 Paquete NPM**: Disponible como librería independiente para proyectos TypeScript/JavaScript
- **🔧 CLI incluido**: Herramienta de línea de comandos para validación rápida
- **Validación de CI**: Valida el formato y dígito verificador de cédulas uruguayas
- **Consulta de datos**: Obtiene información oficial a través de la API de la Lotería Nacional
- **Arquitectura SOLID**: Implementa los 5 principios SOLID para código mantenible
- **TypeScript**: Tipado estático para mayor robustez
- **Express.js**: Framework web rápido y minimalista
- **Middlewares de seguridad**: CORS, Helmet, Rate Limiting
- **Listo para Vercel**: Configuración optimizada para deployment

## 📋 Principios SOLID Implementados

### S - Single Responsibility Principle (SRP)
- `CiValidator`: Solo se encarga de validar cédulas
- `CiService`: Solo maneja las consultas a la API externa
- `CiController`: Solo maneja las peticiones HTTP

### O - Open/Closed Principle (OCP)
- Interfaces extensibles para validadores y servicios
- Nuevos tipos de validación pueden agregarse sin modificar código existente

### L - Liskov Substitution Principle (LSP)
- Las implementaciones de interfaces pueden intercambiarse sin afectar el funcionamiento

### I - Interface Segregation Principle (ISP)
- Interfaces específicas y pequeñas
- No hay dependencias en métodos no utilizados

### D - Dependency Inversion Principle (DIP)
- Dependencias por inyección de dependencias
- Código de alto nivel no depende de implementaciones concretas

## 🛠️ Instalación

### Como Paquete NPM (Recomendado)

```bash
# Instalar la librería
npm install ci-validation

# Uso básico
import { validateCI, validateCIAndQuery } from 'ci-validation';

// Validación simple
console.log(validateCI('19119365')); // true

// Validación con consulta
const result = await validateCIAndQuery('19119365');
console.log(result);
```

### Instalación Global (CLI)

```bash
# Instalar globalmente para usar desde línea de comandos
npm install -g ci-validation

# Usar el CLI
ci-validate 19119365
ci-validate 19119365 --query
```

### Clonar el Repositorio (Desarrollo)

```bash
# Clonar repositorio
git clone <url-del-repo>
cd ci-validation-api

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

## 📡 Endpoints

### GET /health
Verifica el estado de la API

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-30T12:00:00.000Z"
}
```

### POST /api/ci/validate
Valida una cédula de identidad uruguaya

**Request Body:**
```json
{
  "ci": "19119365"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "ci": "19119365",
    "isValid": true,
    "info": "Información obtenida de la Lotería Nacional..."
  }
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "error": "Cédula inválida: formato incorrecto"
}
```

### GET /api/ci/demo
Endpoint de demostración con una cédula de ejemplo

### GET /demo
Página web interactiva para probar la API

La página de demostración incluye:
- **Interfaz amigable**: Formulario simple para ingresar cédulas
- **Validación en tiempo real**: Feedback inmediato sobre errores de formato
- **Respuesta dual**: Muestra tanto la respuesta JSON como un resultado amigable
- **Persistencia en URL**: La cédula se mantiene en la URL al recargar
- **Ejemplos**: Botones para probar cédulas de ejemplo
- **Responsive**: Funciona en dispositivos móviles y desktop
- **Indicadores visuales**: Animaciones y colores para success/error

**Características técnicas:**
- Uso de Tailwind CSS para estilos
- JavaScript vanilla para máximo rendimiento
- Font Awesome para iconos
- Manejo de errores robusto
- Validación del lado cliente antes de enviar

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar linting
npm run lint

# Corregir problemas de linting
npm run lint:fix
```

## 🚀 Deployment en Vercel

1. Conecta tu repositorio con Vercel
2. Vercel detectará automáticamente la configuración
3. Las variables de entorno se configuran en el dashboard de Vercel

### Configuración para Vercel

El proyecto está optimizado para deployment serverless en Vercel:

- **Funciones serverless**: Los endpoints están en la carpeta `/api/`
- **Archivos estáticos**: La página demo está en `/public/`
- **Configuración automática**: `vercel.json` maneja el routing
- **Build automático**: TypeScript se compila automáticamente

### Estructura de Deployment

```
api/
├── index.ts          # Endpoint raíz (GET /)
├── health.ts         # Health check (GET /health)
├── validate.ts       # Validación (POST /api/ci/validate)
└── demo.ts          # Demo API (GET /api/ci/demo)
public/
└── index.html       # Página demo (GET /demo)
```

### URLs en Producción

- **API Root**: `https://ci-validation-h3e8.vercel.app/`
- **Health Check**: `https://ci-validation-h3e8.vercel.app/health`
- **Validación**: `https://ci-validation-h3e8.vercel.app/api/ci/validate`
- **Demo Page**: `https://ci-validation-h3e8.vercel.app/demo`

### Variables de Entorno

- `NODE_ENV`: `production`
- `PORT`: Puerto del servidor (automático en Vercel)

## 📁 Estructura del Proyecto

```
src/
├── controllers/          # Controladores HTTP
│   └── CiController.ts
├── services/            # Servicios de negocio
│   └── CiService.ts
├── validators/          # Validadores
│   └── CiValidator.ts
├── interfaces/          # Definiciones de tipos
│   ├── ICiValidator.ts
│   ├── ICiService.ts
│   └── ApiResponse.ts
├── middleware/          # Middlewares personalizados
│   └── errorHandler.ts
├── routes/             # Definición de rutas
│   └── ciRoutes.ts
├── utils/              # Utilidades
│   └── dependencyContainer.ts
└── index.ts            # Punto de entrada
```

## 🔒 Seguridad

- **CORS**: Configurado para permitir requests desde dominios específicos
- **Helmet**: Headers de seguridad automáticos
- **Rate Limiting**: Límite de requests por IP
- **Validación de entrada**: Validación estricta de datos de entrada

## 📝 Algoritmo de Validación de CI

La validación sigue el algoritmo oficial uruguayo:
1. Verificar que tenga 7-8 dígitos
2. Calcular dígito verificador usando el algoritmo oficial
3. Comparar con el último dígito de la cédula

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 📦 Publicar el Paquete NPM

Si tienes permisos de publicación:

```bash
# Verificar build
npm run build

# Dry run
npm run publish:dry

# Publicar
npm run publish:npm

# O incrementar versión y publicar
npm version patch  # o minor/major
npm run publish:npm
```

Ver [guía completa de publicación](./NPM_PUBLISHING.md) para más detalles.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Enlaces Útiles

### 📖 Documentación Técnica
- [Documentación de Express](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Principios SOLID](https://en.wikipedia.org/wiki/SOLID)
- [Vercel Documentation](https://vercel.com/docs)

### 📦 Paquete NPM
- **[📚 Documentación del Paquete NPM](./NPM_README.md)** - Guía completa de uso de la librería
- **[🚀 Guía de Publicación NPM](./NPM_PUBLISHING.md)** - Instrucciones para publicar actualizaciones
- **[npm Package](https://www.npmjs.com/package/ci-validation)** - Página oficial del paquete

### ⚠️ Seguridad
- **[⚠️ Reporte de Vulnerabilidad de Seguridad](./SECURITY_VULNERABILITY.md)** - Información sobre la vulnerabilidad encontrada en servicios gubernamentales
