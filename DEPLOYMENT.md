# Guía de Deployment para Vercel

Esta guía te ayudará a desplegar la API de Validación de Cédulas Uruguayas en Vercel.

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio Git (GitHub, GitLab, o Bitbucket)
3. Vercel CLI (opcional, para deployment desde terminal)

## Método 1: Deployment desde Dashboard de Vercel

### Paso 1: Conectar Repositorio
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "New Project"
3. Conecta tu cuenta de Git provider (GitHub recomendado)
4. Selecciona este repositorio

### Paso 2: Configuración Automática
Vercel detectará automáticamente:
- Framework: Node.js
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Paso 3: Variables de Entorno (Opcional)
En la configuración del proyecto, agrega:
- `NODE_ENV`: `production`

### Paso 4: Deploy
1. Haz clic en "Deploy"
2. Espera a que termine el build (2-3 minutos)
3. Tu API estará disponible en `https://tu-proyecto.vercel.app`

## Método 2: Deployment con Vercel CLI

### Instalación de Vercel CLI
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Deployment
```bash
# Primer deployment
vercel

# Deployments posteriores
vercel --prod
```

## Verificación del Deployment

### 1. Health Check
```bash
curl https://tu-app.vercel.app/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-07-30T12:00:00.000Z",
  "uptime": 0,
  "version": "1.0.0"
}
```

### 2. API Root
```bash
curl https://tu-app.vercel.app/
```

### 3. Demo Page
Abre en tu navegador: `https://tu-app.vercel.app/demo`

### 4. Validación de Cédula
```bash
curl -X POST https://tu-app.vercel.app/api/ci/validate \
  -H "Content-Type: application/json" \
  -d '{"ci":"19119365"}'
```

## Configuración Avanzada

### Custom Domain
1. Ve a Project Settings → Domains
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones

### Monitoring
1. Ve a Project Settings → Functions
2. Habilita monitoring y logs
3. Configura alertas si es necesario

## Troubleshooting

### Build Errors
- Verificar que todas las dependencias estén en `package.json`
- Revisar errores de TypeScript con `npm run build`
- Verificar la configuración en `vercel.json`

### Runtime Errors
- Revisar logs en Vercel Dashboard
- Verificar que las rutas en `vercel.json` sean correctas
- Confirmar que las imports relativos funcionen

### CORS Issues
- Las funciones serverless ya incluyen headers CORS
- Para dominios específicos, actualizar `corsHeaders` en cada función

## Arquitectura Serverless

### Funciones Desplegadas
- `api/index.ts` → `GET /`
- `api/health.ts` → `GET /health`
- `api/validate.ts` → `POST /api/ci/validate`
- `api/demo.ts` → `GET /api/ci/demo`

### Archivos Estáticos
- `public/index.html` → `GET /demo`

### Limitaciones de Vercel
- **Tiempo máximo de ejecución**: 10 segundos
- **Memoria**: 1024 MB
- **Payload**: 4.5 MB

## Performance

### Cold Starts
- Las funciones serverless tienen "cold start" inicial
- Primera request puede tomar 1-2 segundos
- Requests subsecuentes son más rápidos

### Optimizaciones
- Código está optimizado para cold starts
- Dependencies mínimas en cada función
- Validaciones del lado cliente reducen calls innecesarios

## Monitoreo

### Logs
```bash
vercel logs tu-app.vercel.app
```

### Analytics
En el dashboard de Vercel puedes ver:
- Request count
- Response times
- Error rates
- Bandwidth usage

## Rollback

En caso de problemas:
1. Ve a Project → Deployments
2. Encuentra el deployment anterior estable
3. Haz clic en "..." → "Promote to Production"

## CI/CD

Para setup automático con GitHub Actions, el proyecto detectará automáticamente pushes a main/master y desplegará automáticamente.

## Support

Para problemas específicos:
1. Revisar [Vercel Documentation](https://vercel.com/docs)
2. Verificar [Status Page](https://vercel-status.com/)
3. Contactar soporte si es necesario
