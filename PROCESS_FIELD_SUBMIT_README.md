# ProcessFieldSubmit JSON Formatter

Una utilidad TypeScript para generar objetos JSON limpios y ordenados para requests de `processFieldSubmit`, eliminando elementos duplicados y manteniendo un formato consistente.

## 🚀 Características

- ✅ **Formato consistente**: Garantiza el orden `frmId`, `attId`, `value`
- ✅ **Sin duplicados**: Elimina requests duplicados basados en `frmId` + `attId`
- ✅ **Ordenamiento automático**: Ordena por `frmId` primero, luego por `attId`
- ✅ **Validación**: Verifica la estructura correcta de los objetos
- ✅ **Extracción de URL**: Extrae parámetros directamente de URLs
- ✅ **TypeScript**: Completamente tipado con interfaces

## 📦 Uso Básico

### Crear un request individual

```typescript
import { ProcessFieldSubmitFormatter } from './src/utils/processFieldSubmitFormatter';

const request = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");
console.log(request);
// Output:
// {
//   "frmId": "6687",
//   "attId": "12295", 
//   "value": "1"
// }
```

### Crear múltiples requests (sin duplicados)

```typescript
const requests = [
  { frmId: "6687", attId: "12295", value: "1" },
  { frmId: "6368", attId: "1929", value: "" },
  { frmId: "6368", attId: "1569", value: "1" },
  { frmId: "6687", attId: "12295", value: "1" }, // Duplicado - será eliminado
];

const cleanRequests = ProcessFieldSubmitFormatter.createMultipleRequests(requests);
console.log(cleanRequests);
// Output: Array ordenado sin duplicados
```

### Extraer parámetros de URL

```typescript
const url = "https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run?action=processFieldSubmit&frmId=6368&attId=1929";

const extracted = ProcessFieldSubmitFormatter.extractFromUrl(url);
console.log(extracted);
// Output:
// {
//   "frmId": "6368",
//   "attId": "1929",
//   "value": ""
// }
```

## 🔧 Métodos Disponibles

### `createRequest(frmId, attId, value)`
Crea un objeto JSON limpio con el formato requerido.

### `createMultipleRequests(requests)`
Procesa un array de requests, eliminando duplicados y ordenando.

### `extractFromUrl(url)`
Extrae parámetros `frmId` y `attId` de una URL.

### `toFormattedJson(request, indent)`
Convierte el objeto a JSON string formateado.

### `isValidRequest(obj)`
Valida que un objeto tenga la estructura correcta.

## 🏃‍♂️ Scripts Disponibles

### Ejecutar ejemplos
```bash
npm run example
# o
npx ts-node src/examples/processFieldSubmitExample.ts
```

### Generar JSON limpio
```bash
npm run generate
# o  
npx ts-node src/scripts/generateProcessFieldSubmitJson.ts
```

### Ejecutar tests
```bash
npm test src/utils/processFieldSubmitFormatter.test.ts
```

## 📋 Interfaz TypeScript

```typescript
export interface ProcessFieldSubmitRequest {
  frmId: string;
  attId: string;
  value: string;
}
```

## 🎯 Casos de Uso

1. **Limpiar datos de curl commands**: Convierte los parámetros de múltiples comandos curl en objetos JSON limpios
2. **Eliminar duplicados**: Automaticamente elimina requests duplicados basados en `frmId` + `attId`
3. **Ordenamiento consistente**: Mantiene un orden predecible para facilitar el debugging
4. **Validación de estructura**: Asegura que todos los objetos tengan la estructura correcta

## 🔍 Ejemplo Completo

El formato específico que solicitaste:
```json
{
  "frmId": "6687",
  "attId": "12295",
  "value": "1"
}
```

Se genera automáticamente con:
```typescript
const request = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");
```

## 🧪 Testing

El proyecto incluye tests completos que verifican:
- Creación de objetos limpios
- Eliminación de duplicados
- Ordenamiento correcto
- Extracción de parámetros de URL
- Validación de estructura
- Manejo de valores vacíos
- Limpieza de espacios en blanco

Ejecuta los tests con:
```bash
npx jest src/utils/processFieldSubmitFormatter.test.ts
```
