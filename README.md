# API de Validación de Cédulas Uruguayas

> **⚠️ ACTUALIZACIÓN CRÍTICA 13/08/2025 - SOLUCIONES IMPLEMENTADAS Y NUEVA VULNERABILIDAD ANV**:
>
> **✅❌ SOLUCIÓN MEF CON PROBLEMA OPERACIONAL**:
> - **MEF**: Vulnerabilidad eliminada mediante remoción del endpoint de autocompletado
> - **Consecuencia**: Todos los formularios MEF que dependían del autocompletado ahora están rotos
> - **Estado**: Seguro pero no funcional - usuarios deben ingresar datos manualmente
> - **Impacto**: Pérdida de conveniencia y eficiencia en trámites gubernamentales
>
> **✅❌ SOLUCIÓN AIN CON PROBLEMA OPERACIONAL**:
> - **AIN**: Vulnerabilidad corregida mediante remoción del endpoint de autocompletado
> - **Consecuencia**: La agenda de la aplicación dejó de funcionar por ausencia del autocompletado
> - **Estado**: Seguro pero no funcional - usuarios no pueden usar la funcionalidad de agenda
> - **Impacto**: Pérdida de funcionalidad crítica en la agenda de citas y trámites
>
> **🆘 NUEVA VULNERABILIDAD CRÍTICA DETECTADA**:
> - **ANV**: Aplicación móvil oficial expone nombres completos, apellidos y fecha de nacimiento por autocompletado de cédula
> - La app está disponible en Apple Store y Google Play Store para todos los ciudadanos
> - Cualquier persona puede descargar la aplicación y acceder a datos personales de otros ciudadanos
> - **Sin autenticación**: La aplicación no requiere verificación de identidad para mostrar datos sensibles
> - **Contexto sensible**: Exposición de datos en trámites de vivienda social
>
> **🚨 ESTADO ACTUAL DE VULNERABILIDADES GUBERNAMENTALES**:
> - **MEF**: ✅ **VULNERABILIDAD SOLUCIONADA** - Endpoint removido, pero ❌ **FORMULARIOS ROTOS** - Autocompletado no funciona
> - **AIN**: ✅ **VULNERABILIDAD SOLUCIONADA** - Endpoint removido, pero ❌ **AGENDA ROTA** - Funcionalidad de agenda no funciona
> - **ANV**: **NUEVA** - Aplicación móvil oficial expone información personal completa sin autenticación
> - **Impacto operacional**: Remoción de endpoints MEF y AIN rompió funcionalidad de autocompletado en formularios gubernamentales
> - **Sin verificación de identidad**: ANV no verifica si el trámite se realiza para uno mismo o para terceros
> - **Crisis operacional**: MEF y AIN ahora seguros pero no funcionales, ANV funcional pero vulnerable
>
> **📊 Estado crítico**: Soluciones de seguridad MEF y AIN causaron crisis operacional en formularios gubernamentales.

> **📅 ACTUALIZACIÓN DE SEGURIDAD 07/08/2025**: 
> 
> **⚠️ VULNERABILIDAD MEF RESURGIÓ**:
> La vulnerabilidad en el formulario https://www.tramitesenlinea.mef.gub.uy/Apia/portal/tramite.jsp?id=2629 volvió a resurgir. El sistema de autenticación implementado no verifica correctamente la autenticación y permite el acceso anónimo exponiendo:
> - **Fecha de nacimiento completa** 
> - **Nombre completo** de cualquier ciudadano
> 
> **⚠️ VULNERABILIDAD AIN CORREGIDA**:
> La vulnerabilidad en el formulario https://tramites.ain.gub.uy fue corregida mediante la remoción del endpoint de autocompletado, pero esto comprometió la funcionalidad de la agenda:
> - **Primer nombre** del titular ya no se expone
> - **Primer apellido** del titular ya no se expone
> - **Agenda de la aplicación** dejó de funcionar por ausencia del autocompletado
> 
> **� PROBLEMA DE SEGURIDAD CRÍTICO**:
> - El sistema permite autocompletar datos personales sensibles con solo ingresar una cédula
> - No valida si el usuario está autenticado correctamente con el gobierno
> - No verifica si el trámite se realiza para uno mismo o para terceros
> - Expone información personal sin autorización adecuada
> 
> **✅ MEJORAS TÉCNICAS IMPLEMENTADAS**:
> - ✅ **Extracción de datos mejorada**: Soporte para el nuevo formato de formularios AIN_FRM_GRAL_DATOS_PERSONALES
> - ✅ **Información adicional**: Tipo de documento, país emisor, y componentes individuales de nombres y apellidos
> - ✅ **Manejo de errores optimizado**: Mensajes más descriptivos y manejo específico por tipo de error
> - ✅ **Validación mejorada**: Verificación de formato de cédula antes del procesamiento
> - ✅ **Compatibilidad dual**: Funciona con formatos antiguos y nuevos de formularios gubernamentales
> - ✅ **Logging mejorado**: Mayor detalle en los logs para debugging y monitoreo
> 
> **📊 ESTADO ACTUAL DE SERVICIOS GUBERNAMENTALES**:
> - ✅❌ **Formulario MEF SOLUCIONADO PERO ROTO**: Vulnerabilidad eliminada mediante remoción del endpoint, pero formularios no funcionan
> - ✅❌ **Formulario AIN SOLUCIONADO PERO ROTO**: Vulnerabilidad eliminada mediante remoción del endpoint, pero agenda no funciona
> - ❌ **Formularios de Lotería inoperativos**: Todos los formularios que requieren cédula permanecen fuera de servicio desde 31/07/2025
> - 🆘 **Aplicación ANV VULNERABILIDAD CRÍTICA**: App móvil oficial expone nombres, apellidos y fecha de nacimiento por autocompletado
> 
> **📊 Estado crítico**: Soluciones MEF y AIN crearon crisis operacional - formularios seguros pero inutilizables. ANV mantiene vulnerabilidad activa.
> 
> Ver [reporte completo actualizado](./SECURITY_VULNERABILITY.md) para detalles técnicos.

## 📋 Contexto de Seguridad Pública

> ### ⚠️ **Información para Ciudadanos Uruguayos**
> 
> **Este proyecto surge del análisis de seguridad en sistemas públicos debido a:**
> 
> 🔍 **Ausencia de programas de recompensas** por reportes de seguridad en entidades públicas  
> 🔍 **Falta de canales formales** para reportar vulnerabilidades en sistemas gubernamentales  
> 🔍 **Necesidad de transparencia** en el estado de la ciberseguridad pública  
> 🔍 **Importancia de la educación ciudadana** sobre protección de datos personales  
> 
> **🎯 Objetivo**: Informar sobre el estado de los sistemas informáticos públicos y promover mejores prácticas de seguridad en el manejo de información ciudadana.
>
> **📋 Este proyecto contribuye a:**
> - Generar conciencia sobre la importancia de la ciberseguridad pública
> - Documentar el estado actual de los sistemas gubernamentales
> - Promover la transparencia en la gestión de sistemas públicos
> - Educar sobre buenas prácticas de protección de datos
>
> Consulte el [**📄 Reporte de Vulnerabilidades**](./SECURITY_VULNERABILITY.md) para información técnica detallada.

---

Una API RESTful construida con TypeScript y Express siguiendo los principios SOLID para validar cédulas de identidad uruguayas y consultar información a través del formulario oficial del MEF (Ministerio de Economía y Finanzas).

## 🆕 Nuevas Características (Agosto 2025)

### 📋 **Extracción de Datos Mejorada**
- **Tipo de documento**: Identifica si es Cédula de Identidad, Pasaporte u Otro
- **País emisor**: Detecta el país que emitió el documento (Uruguay, Argentina, etc.)
- **Componentes individuales**: Extrae primer nombre, segundo nombre, primer apellido, segundo apellido por separado
- **Compatibilidad dual**: Funciona con formatos antiguos y nuevos de formularios

### 🔧 **Mejoras Técnicas**
- **Validación previa**: Verifica formato de cédula antes del procesamiento
- **Manejo de errores optimizado**: Mensajes específicos por tipo de error
- **Logging avanzado**: Mayor detalle para debugging y monitoreo
- **Performance mejorado**: Tiempos de procesamiento optimizados
- **Configuración validada**: Verificación automática de configuración del servicio

### 📊 **Datos Adicionales Extraídos**
```json
{
  "success": true,
  "data": {
    "persona": {
      "nombre": "EDELMA",
      "apellido": "de SOUZA", 
      "cedula": "14115499",
      "tipoDocumento": "Cédula de Identidad",
      "paisEmisor": "URUGUAY",
      "primerNombre": "EDELMA",
      "primerApellido": "de SOUZA",
      "processingTime": 1250,
      "hasSession": true
    }
  }
}
```

## 📦 Paquete NPM Disponible

**¡Esta funcionalidad también está disponible como paquete npm!**

```bash
# Instalar el paquete
npm install ci-validation

# Uso básico
import { validateCIAndQuery } from 'ci-validation';
const result = await validateCIAndQuery('19119365');
console.log(result);
// Output (solo validación local - servicios gubernamentales con vulnerabilidades):
// {        
//   "success": true,
//   "data": {
//     "ci": "19119365",
//     "isValid": true,
//     "normalizedCi": "19119365",
//     "info": "Validación local únicamente - Servicios gubernamentales presentan vulnerabilidades desde 07/08/2025"
//   }
// }
```

🔗 **Enlaces del paquete**:
- **npm**: https://www.npmjs.com/package/ci-validation
- **Documentación completa**: [NPM_README.md](./NPM_README.md)
- **Guía de publicación**: [NPM_PUBLISHING.md](./NPM_PUBLISHING.md)

## 🚀 Características

- **📦 Paquete NPM**: Disponible como librería independiente para proyectos TypeScript/JavaScript
- **🔧 CLI incluido**: Herramienta de línea de comandos para validación rápida
- **Validación de CI**: Valida el formato y dígito verificador de cédulas uruguayas
- **Consulta de datos**: Obtiene información oficial a través del formulario del MEF
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

// Validación con consulta (servicios gubernamentales con disponibilidad limitada)
const result = await validateCIAndQuery('19119365');
console.log(result);
```

### Instalación Global (CLI)

```bash
# Instalar globalmente para usar desde línea de comandos
npm install -g ci-validation

```bash
# Usar el CLI
ci-validate 19119365
ci-validate 19119365 --query  # Consulta a servicios gubernamentales (disponibilidad limitada)
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
    "info": "Información obtenida del formulario oficial del MEF..."
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

### POST /api/ci/smi
Consulta información específica de SMI (Sociedad de Medicina del Interior) por cédula

**Request Body:**
```json
{
  "ci": "19119365"
}
```

**También disponible como GET:**
```bash
GET /api/ci/smi?ci=19119365
```

**Respuesta exitosa (usuario registrado):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "hasUser": true,
    "member": {
      "ci": "19119365",
      "status": "registered",
      "executionTime": 1250,
      "userData": {
        "perID": "12345",
        "perCI": "19119365",
        "perMail": "user@email.com",
        "domicTel": "099123456",
        "isValidUser": true
      }
    }
  },
  "timestamp": "2025-08-13T12:00:00.000Z",
  "executionTime": {
    "total": 1300,
    "validation": 5,
    "query": 1250
  }
}
```

**Respuesta exitosa (usuario no registrado):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "hasUser": false,
    "error": "Usuario no registrado en SMI"
  },
  "timestamp": "2025-08-13T12:00:00.000Z",
  "executionTime": {
    "total": 800,
    "validation": 5,
    "query": 750
  }
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "error": "Cédula inválida: formato incorrecto",
  "code": "INVALID_FORMAT"
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
├── smi.ts           # Consulta SMI (POST /api/ci/smi)
└── demo.ts          # Demo API (GET /api/ci/demo)
public/
└── index.html       # Página demo (GET /demo)
```

### URLs en Producción

- **API Root**: `https://ci-validation.vercel.app/`
- **Health Check**: `https://ci-validation.vercel.app/health`
- **Validación**: `https://ci-validation.vercel.app/api/ci/validate`
- **Demo Page**: `https://ci-validation.vercel.app/demo`

### Variables de Entorno

- `NODE_ENV`: `production`
- `PORT`: Puerto del servidor (automático en Vercel)

#### Configuración de Proxy SMI (Opcional)

Para usar un proxy externo para las consultas SMI (útil cuando no se puede acceder directamente a SMI):

- `SMI_PROXY`: URL completa del servidor proxy que tiene acceso a SMI (ej: `https://xxxxxx.com`)

**Ejemplo de configuración en `.env`:**
```bash
# Usar proxy externo para SMI
SMI_PROXY=https://xxxx.com
```

> **Nota**: Cuando se configura `SMI_PROXY`, el servicio hará peticiones a `{SMI_PROXY}/api/smi?ci=xxx` en lugar de conectar directamente a SMI.

#### Configuración de Proxy (Opcional)

Para enrutar las peticiones HTTP a través de un servidor proxy, puedes usar cualquiera de estos métodos:

**Método 1: URL completa (recomendado)**
- `PROXY`: URL completa del proxy (ej: `http://179.27.158.18:80`)

**Método 2: Variables individuales (para compatibilidad)**
- `PROXY_HOST`: Dirección del servidor proxy (ej: `proxy.empresa.com`)
- `PROXY_PORT`: Puerto del proxy (ej: `8080`)
- `PROXY_PROTOCOL`: Protocolo del proxy (`http` o `https`, por defecto `http`)
- `PROXY_USERNAME`: Usuario para autenticación del proxy (opcional)
- `PROXY_PASSWORD`: Contraseña para autenticación del proxy (opcional)

**Ejemplos de configuración en `.env`:**
```bash
# Método simple (recomendado)
PROXY=http://179.27.158.18:80

# Con autenticación
PROXY=http://usuario:contraseña@proxy.empresa.com:8080

# Método alternativo (variables individuales)
PROXY_HOST=proxy.empresa.com
PROXY_PORT=8080
PROXY_PROTOCOL=http
PROXY_USERNAME=mi_usuario
PROXY_PASSWORD=mi_contraseña
```

> **Nota**: El soporte de proxy está disponible para todas las consultas a servicios externos (SMI, lotería, etc.)

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
- **[🔍 Informe Técnico de Vulnerabilidad IDOR](./TECHNICAL_VULNERABILITY_REPORT.md)** - Análisis técnico detallado de la vulnerabilidad
- **[🛡️ Política de Seguridad y VDP](./SECURITY.md)** - Programa de Divulgación Responsable de Vulnerabilidades
