# API de Validación de Cédulas Uruguayas

Una API RESTful construida con TypeScript y Express siguiendo los principios SOLID para validar cédulas de identidad uruguayas y consultar información a través del servicio oficial de la Lotería Nacional.

## 🚀 Características

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

```bash
# Clonar el repositorio
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

- **API Root**: `https://tu-app.vercel.app/`
- **Health Check**: `https://tu-app.vercel.app/health`
- **Validación**: `https://tu-app.vercel.app/api/ci/validate`
- **Demo Page**: `https://tu-app.vercel.app/demo`

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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Enlaces Útiles

- [Documentación de Express](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Principios SOLID](https://en.wikipedia.org/wiki/SOLID)
- [Vercel Documentation](https://vercel.com/docs)
