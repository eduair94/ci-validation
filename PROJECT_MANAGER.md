# API de Validación de Cédulas Uruguayas

## Descripción General
API RESTful para validar cédulas de identidad uruguayas y consultar información oficial a través del servicio de la Lotería Nacional del Uruguay.

## Arquitectura Técnica

### Stack Tecnológico
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Lenguaje**: TypeScript 5.3+
- **HTTP Client**: Axios 1.6+
- **Seguridad**: Helmet, CORS, Rate Limiting

### Principios SOLID Implementados

#### 1. Single Responsibility Principle (SRP)
Cada clase tiene una única responsabilidad:
- `CiValidator`: Validación de formato y dígito verificador
- `CiService`: Comunicación con API externa
- `CiController`: Manejo de requests HTTP
- `ErrorHandler`: Gestión centralizada de errores

#### 2. Open/Closed Principle (OCP)
El sistema está abierto para extensión pero cerrado para modificación:
- Interfaces `ICiValidator` e `ICiService` permiten nuevas implementaciones
- Nuevos validadores pueden agregarse sin modificar código existente
- Middleware pipeline extensible

#### 3. Liskov Substitution Principle (LSP)
Las implementaciones pueden intercambiarse sin afectar funcionalidad:
- Cualquier implementación de `ICiValidator` funciona correctamente
- Diferentes servicios de consulta pueden utilizarse intercambiablemente

#### 4. Interface Segregation Principle (ISP)
Interfaces específicas y cohesivas:
- `ICiValidator` solo expone métodos de validación
- `ICiService` solo métodos de consulta
- No hay dependencias en métodos no utilizados

#### 5. Dependency Inversion Principle (DIP)
Dependencias por inversión de control:
- Controladores dependen de abstracciones, no implementaciones
- Inyección de dependencias mediante contenedor
- Facilita testing y mantenimiento

## Características Funcionales

### Validación de Cédulas
- **Formato**: Acepta 7-8 dígitos numéricos
- **Algoritmo**: Implementa algoritmo oficial uruguayo de dígito verificador
- **Normalización**: Formatea automáticamente con ceros a la izquierda
- **Sanitización**: Limpia caracteres no numéricos

### Consulta de Información
- **Endpoint**: `http://tramites.loteria.gub.uy/bandejatramites/action`
- **Método**: POST con `application/x-www-form-urlencoded`
- **Parámetros**: 
  - `cmdaction`: "obtenercedula"
  - `numero`: Número de cédula
- **Timeout**: 10 segundos
- **Retry**: No implementado (servicio oficial)

### Seguridad
- **CORS**: Configurado para dominios específicos
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad HTTP
- **Sanitización**: Validación estricta de entrada
- **Error Handling**: No exposición de información sensible

## Endpoints API

### Health Check
```
GET /health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-30T12:00:00.000Z",
  "uptime": 3600
}
```

### Validación de Cédula
```
POST /api/ci/validate
Content-Type: application/json

{
  "ci": "47073450"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "ci": "47073450",
    "isValid": true,
    "normalizedCi": "47073450",
    "info": "Datos obtenidos del servicio oficial..."
  }
}
```

**Respuesta con Error:**
```json
{
  "success": false,
  "error": "Cédula inválida: dígito verificador incorrecto",
  "code": "INVALID_CI"
}
```

### Demo Page
```
GET /demo
```
Página web interactiva para testing de la API.

**Características:**
- **UI/UX Moderna**: Interfaz glassmorphism con Tailwind CSS
- **Responsive Design**: Funciona en mobile y desktop
- **Validación Cliente**: Validación previa antes del request
- **Persistencia URL**: CI se mantiene en URL al recargar página
- **Feedback Visual**: Animaciones y colores para success/error
- **JSON Display**: Muestra respuesta raw de la API
- **Copy to Clipboard**: Funcionalidad para copiar JSON
- **Ejemplos Interactivos**: Botones para probar cédulas válidas
- **Keyboard Shortcuts**: Ctrl+Enter para validar, Escape para limpiar

**Stack Técnico:**
- HTML5 + CSS3 (Tailwind)
- JavaScript ES6+ (Vanilla)
- Font Awesome Icons
- Fetch API para requests
- URL Search Params para persistencia

## Códigos de Error

- `INVALID_FORMAT`: Formato de cédula incorrecto
- `INVALID_CI`: Dígito verificador incorrecto
- `EXTERNAL_SERVICE_ERROR`: Error en servicio externo
- `TIMEOUT_ERROR`: Timeout en consulta
- `RATE_LIMIT_EXCEEDED`: Límite de requests excedido

## Algoritmo de Validación

El algoritmo oficial uruguayo para validar cédulas:

1. **Normalización**: Completar con ceros a la izquierda hasta 8 dígitos
2. **Cálculo del dígito verificador**:
   - Multiplicar cada dígito por el factor correspondiente: [2,9,8,7,6,3,4]
   - Sumar todos los productos
   - Calcular módulo 10 del resultado
   - El dígito verificador es (10 - módulo) % 10
3. **Verificación**: Comparar con el último dígito de la cédula

## Estructura de Archivos

```
src/
├── controllers/
│   └── CiController.ts         # Controlador HTTP principal
├── services/
│   └── CiService.ts           # Servicio de consulta externa
├── validators/
│   └── CiValidator.ts         # Validador de cédulas
├── interfaces/
│   ├── ICiValidator.ts        # Interface del validador
│   ├── ICiService.ts          # Interface del servicio
│   └── ApiResponse.ts         # Tipos de respuesta
├── middleware/
│   ├── errorHandler.ts        # Manejo de errores
│   └── rateLimiter.ts         # Rate limiting
├── routes/
│   └── ciRoutes.ts           # Definición de rutas
├── utils/
│   └── dependencyContainer.ts # Contenedor DI
└── index.ts                  # Punto de entrada
```

## Configuración para Vercel

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

### Variables de Entorno
- `NODE_ENV`: production
- `PORT`: (automático en Vercel)

## Performance

### Métricas Objetivo
- **Tiempo de respuesta**: < 2 segundos
- **Disponibilidad**: 99.9%
- **Throughput**: 1000 requests/minuto
- **Memory usage**: < 256MB

### Optimizaciones
- Response caching para cédulas válidas
- Connection pooling para requests HTTP
- Compresión gzip automática
- Headers de cache apropiados

## Monitoreo y Logging

### Logs Estructurados
```json
{
  "timestamp": "2025-07-30T12:00:00.000Z",
  "level": "info",
  "message": "CI validation request",
  "ci": "470734**",
  "ip": "192.168.1.1",
  "duration": 1250
}
```

### Métricas
- Request count por endpoint
- Response time percentiles
- Error rate por tipo
- Rate limit hits

## Testing

### Casos de Prueba
- Cédulas válidas conocidas
- Cédulas con formato incorrecto
- Cédulas con dígito verificador incorrecto
- Timeouts del servicio externo
- Rate limiting
- Manejo de errores

### Cobertura Objetivo
- **Líneas**: > 90%
- **Funciones**: > 95%
- **Branches**: > 85%

## Deployment

### Pre-requisitos
- Node.js 18+
- npm o yarn
- Cuenta en Vercel

## Deployment

### Pre-requisitos
- Node.js 18+
- npm o yarn
- Cuenta en Vercel

### Estructura Serverless
```
api/
├── index.ts          # Endpoint raíz (GET /)
├── health.ts         # Health check (GET /health)
├── validate.ts       # Validación (POST /api/ci/validate)
└── demo.ts          # Demo API (GET /api/ci/demo)
public/
└── index.html       # Página demo (GET /demo)
```

### Pasos
1. Build del proyecto: `npm run build`
2. Testing: `npm test`
3. Deploy en Vercel: automático desde Git
4. Verificación de health check

### Configuración Vercel
- **Framework**: Node.js detectado automáticamente
- **Build Command**: `npm run build`
- **Functions**: Serverless con max 10s timeout
- **Static Files**: Servidos desde `/public/`
- **Routing**: Configurado en `vercel.json`

### URLs Deployed
- **Root**: `https://app.vercel.app/`
- **Health**: `https://app.vercel.app/health`
- **Demo Page**: `https://app.vercel.app/demo`
- **API Validate**: `https://app.vercel.app/api/ci/validate`

### Features Serverless
- **Cold Start Optimized**: Dependencias mínimas
- **CORS Enabled**: Headers configurados para cross-origin
- **Error Handling**: Respuestas consistentes
- **Monitoring**: Logs automáticos en Vercel Dashboard

## Compliance y Regulaciones

### Privacidad
- No almacenamiento persistente de datos
- No tracking de usuarios
- Logs anonimizados

### Seguridad
- HTTPS obligatorio
- Headers de seguridad
- Validación estricta de entrada
- No exposición de stacktraces

## Mantenimiento

### Actualizaciones Regulares
- Dependencias de seguridad: semanal
- Dependencias menores: mensual
- Dependencias mayores: trimestral

### Monitoreo de Servicios Externos
- Health check del servicio de Lotería
- Alertas por fallos
- Fallback strategies

## Support y Documentación

### Recursos
- README.md: Documentación básica
- API Documentation: Endpoints y ejemplos
- Architecture Decision Records: Decisiones técnicas
- Troubleshooting Guide: Solución de problemas

### Contacto
- Issues en GitHub
- Documentación técnica actualizada
- Guías de contributing
