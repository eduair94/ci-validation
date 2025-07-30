# Instalación y Publicación del Paquete NPM

## 📦 Preparación para Publicación

### 1. Verificar configuración

```bash
# Verificar que estés logueado en npm
npm whoami

# Si no estás logueado
npm login
```

### 2. Build del paquete

```bash
# Construir el paquete completo
npm run build

# Verificar que todo esté correcto
npm run publish:dry
```

### 3. Publicar

```bash
# Publicar a npm (primera vez)
npm run publish:npm

# O usar directamente
npm publish --access public
```

## 🔄 Actualización de Versiones

### Versión Patch (1.0.0 → 1.0.1)
```bash
npm version patch
npm run publish:npm
```

### Versión Minor (1.0.0 → 1.1.0)
```bash
npm version minor
npm run publish:npm
```

### Versión Major (1.0.0 → 2.0.0)
```bash
npm version major
npm run publish:npm
```

## 📋 Checklist Pre-Publicación

- [ ] Tests pasando: `npm test`
- [ ] Linting limpio: `npm run lint`
- [ ] Build exitoso: `npm run build`
- [ ] Dry run exitoso: `npm run publish:dry`
- [ ] README.md actualizado
- [ ] CHANGELOG.md actualizado (si existe)
- [ ] Version bumped correctamente

## 🏷️ Tags y Releases

```bash
# Crear tag
git tag v1.0.0
git push origin v1.0.0

# O usar npm version que hace esto automáticamente
npm version patch --git-tag-version
```

## 📊 Verificación Post-Publicación

1. **Verificar en npmjs.com**: https://www.npmjs.com/package/ci-validation
2. **Probar instalación**:
   ```bash
   npm install ci-validation
   ```
3. **Verificar importación**:
   ```javascript
   const { validateCI } = require('ci-validation');
   console.log(validateCI('19119365'));
   ```

## 🔗 Enlaces del Paquete

- **npm Package**: https://www.npmjs.com/package/ci-validation
- **Bundle Size**: https://bundlephobia.com/package/ci-validation
- **Download Stats**: https://npm-stat.com/charts.html?package=ci-validation

## 🛠️ Comandos de Mantenimiento

```bash
# Ver información del paquete
npm view ci-validation

# Ver versiones publicadas
npm view ci-validation versions --json

# Deprecar una versión
npm deprecate ci-validation@1.0.0 "Please upgrade to latest version"

# Unpublish (solo dentro de 72 horas)
npm unpublish ci-validation@1.0.0
```

## 📈 Métricas y Monitoreo

Para monitorear el uso del paquete:

1. **npm stats**: https://npm-stat.com/charts.html?package=ci-validation
2. **Bundle analyzer**: https://bundlephobia.com/package/ci-validation
3. **GitHub insights**: En el repositorio de GitHub

## 🤝 Colaboradores

Si otros desarrolladores van a publicar:

```bash
# Agregar colaborador
npm owner add <username> ci-validation

# Ver owners
npm owner ls ci-validation

# Remover colaborador
npm owner rm <username> ci-validation
```
