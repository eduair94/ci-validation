# PersonaUtils - Análisis de Información Personal

## Instalación de Dependencias

Para que funcione completamente el análisis de género, ejecuta:

```bash
npm install
```

Esto instalará la librería `gender-detection-from-name` que se agregó al package.json.

## Funcionalidades Implementadas

### 1. **Detección de Género**
- Determina el género basado en el primer nombre
- Soporta español e inglés 
- Proporciona nivel de confianza
- Maneja nombres compuestos

### 2. **Información Adicional**
- **Iniciales**: Genera iniciales del nombre y apellidos
- **Nombre completo**: Concatena nombres y apellidos
- **Longitud del nombre**: Cuenta caracteres totales
- **Segundo nombre**: Detecta si tiene segundo nombre
- **Cantidad de nombres**: Cuenta cuántos nombres tiene
- **Generación**: Determina generación basada en edad

### 3. **Utilidades de Validación**
- Normalizar nombres (formato título)
- Validar caracteres permitidos en nombres
- Parsear formato uruguayo "Apellido, Nombre"

## Campos Agregados al JSON de Respuesta

```json
{
  "success": true,
  "data": {
    "persona": {
      "nombre": "María José",
      "apellido": "González Pérez", 
      "fechaNacimiento": "15/03/1990",
      "fechaNacimientoDate": "1990-03-15T00:00:00.000Z",
      "edad": 35,
      "cedula": "12345678",
      
      // ✨ NUEVOS CAMPOS AGREGADOS:
      "genero": {
        "genero": "femenino",
        "confianza": "alta",
        "primerNombre": "María",
        "segundoNombre": "José"
      },
      "iniciales": "M.J.G.P.",
      "nombreCompleto": "María José González Pérez",
      "longitudNombre": 26,
      "tieneSegundoNombre": true,
      "cantidadNombres": 2,
      "generacion": "Millennial"
    }
  }
}
```

## Casos de Uso

### Detección de Género con Confianza
- **Alta confianza**: Nombre encontrado en base de datos español
- **Media confianza**: Nombre encontrado solo en inglés
- **Baja confianza**: No encontrado, resultado incierto

### Generaciones por Año de Nacimiento
- **Gen Z**: 1997 en adelante
- **Millennial**: 1981-1996
- **Gen X**: 1965-1980
- **Baby Boomer**: 1946-1964
- **Silent Generation**: 1928-1945

## Testing

Ejecutar tests:
```bash
npx ts-node src/utils/personaUtils.test.ts
```

## Próximas Mejoras

1. **Instalación completa de gender-detection-from-name** para mejor precisión
2. **Base de datos de nombres uruguayos** para mayor exactitud local
3. **Detección de nombres indígenas** común en Uruguay
4. **Análisis de apellidos** para información genealógica
5. **Integración con bases de datos** de población uruguaya
