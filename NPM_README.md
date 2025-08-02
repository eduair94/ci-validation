# ci-validation 🇺🇾

[![npm version](https://badge.fury.io/js/ci-validation.svg)](https://badge.fury.io/js/ci-validation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Una librería TypeScript/JavaScript completa para validar cédulas de identidad uruguayas siguiendo el algoritmo oficial y consultando información a través de servicios gubernamentales.

> **� ACTUALIZACIÓN CRÍTICA 02/08/2025**: Todos los endpoints gubernamentales han sido inhabilitados. El endpoint del MEF retorna error `{"message":"Lo sentimos, ocurrió un error al ejecutarse la operación.","status":1000}`. Solo la validación algorítmica local permanece funcional. Los formularios oficiales de Lotería y MEF no funcionan.

## ⚡ Instalación

```bash
npm install ci-validation
```

## 🚀 Uso Rápido

### Validación Simple

```typescript
import { validateCI } from 'ci-validation';

// Validar cédula
const isValid = validateCI('19119365');
console.log(isValid); // true

// Casos inválidos
console.log(validateCI('12345678')); // false
console.log(validateCI('1234567a')); // false
```

### Validación con Consulta

```typescript
import { validateCIAndQuery } from 'ci-validation';

const result = await validateCIAndQuery('19119365');

if (result.success) {
  console.log('Cédula válida:', result.data);
  // Output (solo validación local - endpoints inhabilitados):
  // {
  //   "ci": "19119365",
  //   "isValid": true,
  //   "normalizedCi": "19119365",
  //   "info": "Validación local únicamente - Servicios gubernamentales no disponibles desde 02/08/2025"
  // }
} else {
  console.log('Error:', result.error);
}
```

### Uso como CLI

```bash
# Instalar globalmente
npm install -g ci-validation

# Validar desde línea de comandos
ci-validate 19119365
```

## 📚 API Completa

### `validateCI(ci: string): boolean`

Valida una cédula uruguaya usando el algoritmo oficial de dígito verificador.

```typescript
import { validateCI } from 'ci-validation';

console.log(validateCI('19119365')); // true
console.log(validateCI('1911936')); // false (dígito incorrecto)
```

### `normalizeCI(ci: string): string`

Normaliza una cédula agregando ceros a la izquierda y removiendo caracteres no numéricos.

```typescript
import { normalizeCI } from 'ci-validation';

console.log(normalizeCI('1234567')); // '01234567'
console.log(normalizeCI('1.234.567-8')); // '12345678'
```

### `validateCIFormat(ci: string): boolean`

Valida solo el formato (7-8 dígitos numéricos) sin verificar el dígito verificador.

```typescript
import { validateCIFormat } from 'ci-validation';

console.log(validateCIFormat('1234567')); // true
console.log(validateCIFormat('123456a')); // false
```

### `queryCIInfo(ci: string): Promise<CiQueryResponse>`

Consulta información oficial sobre una cédula (requiere conexión a internet).

```typescript
import { queryCIInfo } from 'ci-validation';

const result = await queryCIInfo('19119365');
if (result.success) {
  console.log('Información:', result.data);
} else {
  console.log('Error:', result.error);
}
```

### `validateCIAndQuery(ci: string): Promise<ValidationResult>`

Combina validación y consulta en una sola función.

```typescript
import { validateCIAndQuery } from 'ci-validation';

const result = await validateCIAndQuery('19119365');
console.log(result);
// Output (solo validación local - endpoints inhabilitados):
// {        
//   "success": true,
//   "data": {
//     "ci": "19119365",
//     "isValid": true,
//     "normalizedCi": "19119365",
//     "info": "Validación local únicamente - Servicios gubernamentales no disponibles desde 02/08/2025"
//   }
// }
```

## 🏗️ Uso Avanzado con Clases

```typescript
import { UruguayanCiValidator, LoteriaUyCiService } from 'ci-validation';

const validator = new UruguayanCiValidator();
const service = new LoteriaUyCiService();

// Validación personalizada
const ci = '19119365';
const isValid = validator.validate(ci);
const normalized = validator.normalize(ci);

// Consulta con manejo de errores
try {
  const info = await service.queryCiInfo(normalized);
  console.log(info);
} catch (error) {
  console.error('Error al consultar:', error);
}
```

## 🌐 Uso en el Navegador

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/ci-validation@latest/dist/lib/index.js"></script>
</head>
<body>
  <script>
    const { validateCI } = CiValidation;
    console.log(validateCI('19119365')); // true
  </script>
</body>
</html>
```

## 🔧 CLI (Command Line Interface)

### Instalación

```bash
npm install -g ci-validation
```

### Uso

```bash
# Validación simple
ci-validate 19119365

# Validación con consulta
ci-validate 19119365 --query

# Múltiples cédulas
ci-validate 19119365 12345678 87654321

# Ayuda
ci-validate --help
```

## 📋 Tipos TypeScript

```typescript
interface CiQueryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ValidationResult {
  success: boolean;
  data?: {
    ci: string;
    isValid: boolean;
    normalizedCi: string;
    info: any;
  };
  error?: string;
  code?: string;
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Opcional: Timeout personalizado para consultas (ms)
CI_VALIDATION_TIMEOUT=10000

# Opcional: URL base personalizada
CI_VALIDATION_BASE_URL=custom-url
```

### En Node.js

```typescript
// Configurar timeout
process.env.CI_VALIDATION_TIMEOUT = '15000';

import { LoteriaUyCiService } from 'ci-validation';
const service = new LoteriaUyCiService();
```

## 🧪 Testing

```typescript
import { validateCI, normalizeCI } from 'ci-validation';

describe('CI Validation', () => {
  test('should validate correct CI', () => {
    expect(validateCI('19119365')).toBe(true);
  });

  test('should normalize CI', () => {
    expect(normalizeCI('1234567')).toBe('01234567');
  });
});
```

## 📖 Algoritmo de Validación

La validación sigue el algoritmo oficial uruguayo:

1. **Formato**: 7-8 dígitos numéricos
2. **Normalización**: Agregar ceros a la izquierda hasta 8 dígitos
3. **Cálculo**: Aplicar algoritmo de dígito verificador
4. **Verificación**: Comparar con el último dígito

### Ejemplo del algoritmo:

```
CI: 1911936X (X = dígito a verificar)

Multiplicadores: 2, 9, 8, 7, 6, 3, 4
Cálculo: (1×2 + 9×9 + 1×8 + 1×7 + 9×6 + 3×3 + 6×4) = 185
Módulo: 185 % 10 = 5
Dígito verificador: (10 - 5) % 10 = 5

CI válida: 19119365
```

## 🔒 Seguridad y Privacidad

- ✅ **Sin almacenamiento**: No guarda cédulas ni información personal
- ✅ **Validación local**: El algoritmo se ejecuta localmente (única funcionalidad disponible)
- ❌ **Consultas externas**: Todos los endpoints gubernamentales inhabilitados desde 02/08/2025
- ✅ **Error handling**: Manejo robusto de errores de red y endpoints caídos
- ⚠️ **Funcionalidad limitada**: Solo validación algorítmica disponible
- 🔴 **Estado crítico**: Servicios oficiales de Lotería y MEF no operativos

## 🌟 Características

- ✅ **TypeScript**: Tipado completo y autocompletado
- ✅ **Cero dependencias**: Core sin dependencias externas
- ✅ **Universal**: Funciona en Node.js y navegadores
- ✅ **CLI incluido**: Herramienta de línea de comandos
- ✅ **Tests incluidos**: Suite de tests completa
- ✅ **ESM/CJS**: Soporta ambos formatos de módulos
- ✅ **Documentación**: Documentación completa con ejemplos

## 📊 Compatibilidad

- **Node.js**: >= 18.0.0
- **Navegadores**: Modernos (ES2020+)
- **TypeScript**: >= 4.5.0
- **Frameworks**: React, Vue, Angular, Svelte, etc.

## 🤝 Contribuir

```bash
# Clonar repositorio
git clone https://github.com/eduair94/ci-validation.git
cd ci-validation

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Build
npm run build
```

## 📄 Licencia

MIT © [Eduardo Airaudo](https://github.com/eduair94)

## 🔗 Enlaces

- **GitHub**: https://github.com/eduair94/ci-validation
- **npm**: https://www.npmjs.com/package/ci-validation
- **Demo**: https://ci-validation-h3e8.vercel.app/
- **Documentación**: https://github.com/eduair94/ci-validation#readme

## ⚠️ Descargo de Responsabilidad

**IMPORTANTE**: A partir del 02/08/2025, todos los servicios gubernamentales de consulta de cédulas han sido inhabilitados:

- **Lotería Nacional**: Inhabilitado desde 31/07/2025
- **MEF**: Inhabilitado desde 02/08/2025 (Error: "Lo sentimos, ocurrió un error al ejecutarse la operación")

Esta librería ahora solo puede realizar:
- ✅ **Validación algorítmica local** (verificación de dígito verificador)
- ❌ **Consultas de información personal** (no disponibles)

El uso debe ser únicamente para validación de formato y algoritmo. No es posible obtener información personal de los ciudadanos a través de esta librería desde las fechas mencionadas.

---

**¿Encontraste útil esta librería? ⭐ Dale una estrella en GitHub!**
