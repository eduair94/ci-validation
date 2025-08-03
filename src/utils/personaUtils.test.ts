import { PersonaUtils } from "../utils/personaUtils";

/**
 * Test para las utilidades de análisis de persona
 */
function testPersonaUtils() {
  console.log("=== Testing PersonaUtils ===");

  // Test casos de nombres uruguayos comunes
  const testCases = [
    { nombres: "María José", apellidos: "González Pérez", edad: 25 },
    { nombres: "Juan Carlos", apellidos: "Rodríguez Silva", edad: 45 },
    { nombres: "Andrea", apellidos: "Martínez", edad: 30 },
    { nombres: "Roberto", apellidos: "López García", edad: 55 },
    { nombres: "Sofía", apellidos: "Fernández", edad: 20 },
    { nombres: "Diego Alejandro", apellidos: "Suárez Olivera", edad: 35 },
    { nombres: "Carmen", apellidos: "Vázquez", edad: 65 },
    { nombres: "Fernando José", apellidos: "Morales Castro", edad: 40 },
  ];

  testCases.forEach((caso, index) => {
    console.log(`\n--- Test Case ${index + 1}: ${caso.nombres} ${caso.apellidos} ---`);

    const info = PersonaUtils.analizarPersona(caso.nombres, caso.apellidos, caso.edad);

    console.log(`📋 Información completa:`);
    console.log(`  👤 Nombre completo: "${info.nombreCompleto}"`);
    console.log(`  🔤 Iniciales: "${info.iniciales}"`);
    console.log(`  📏 Longitud del nombre: ${info.longitudNombre} caracteres`);
    console.log(`  🔢 Cantidad de nombres: ${info.cantidadNombres}`);
    console.log(`  ✨ Tiene segundo nombre: ${info.tieneSegundoNombre ? "Sí" : "No"}`);
    console.log(`  👥 Generación: ${info.generacion || "No determinada"}`);

    console.log(`  🚻 Género:`);
    console.log(`    - Resultado: ${info.genero.genero}`);
    console.log(`    - Confianza: ${info.genero.confianza}`);
    console.log(`    - Primer nombre: "${info.genero.primerNombre}"`);
    if (info.genero.segundoNombre) {
      console.log(`    - Segundo nombre: "${info.genero.segundoNombre}"`);
    }
  });

  // Test casos especiales
  console.log("\n=== Testing Casos Especiales ===");

  // Nombres con caracteres especiales
  const casosEspeciales = [
    { nombres: "José María", apellidos: "O'Connor", descripcion: "Nombre con apostrofe" },
    { nombres: "Ana-Lucía", apellidos: "Pérez-Silva", descripcion: "Nombres con guiones" },
    { nombres: "María de los Ángeles", apellidos: "del Rosario", descripcion: "Nombres compuestos largos" },
    { nombres: "", apellidos: "Solo Apellido", descripcion: "Sin nombres" },
    { nombres: "Solo Nombre", apellidos: "", descripcion: "Sin apellidos" },
  ];

  casosEspeciales.forEach((caso) => {
    console.log(`\n--- ${caso.descripcion} ---`);
    const info = PersonaUtils.analizarPersona(caso.nombres, caso.apellidos);
    console.log(`  Resultado: "${info.nombreCompleto}"`);
    console.log(`  Iniciales: "${info.iniciales}"`);
    console.log(`  Género: ${info.genero.genero} (${info.genero.confianza})`);
  });

  // Test utilidades individuales
  console.log("\n=== Testing Utilidades Individuales ===");

  // Test normalizarNombres
  console.log("\n🔤 Test normalizarNombres:");
  const nombresParaNormalizar = ["MARÍA JOSÉ", "juan carlos", "ANA-lucía"];
  nombresParaNormalizar.forEach((nombre) => {
    const normalizado = PersonaUtils.normalizarNombres(nombre);
    console.log(`  "${nombre}" → "${normalizado}"`);
  });

  // Test validarNombre
  console.log("\n✅ Test validarNombre:");
  const nombresParaValidar = ["María José", "Juan123", "Ana-Lucía", "O'Connor", "", "   ", "José María"];
  nombresParaValidar.forEach((nombre) => {
    const esValido = PersonaUtils.validarNombre(nombre);
    console.log(`  "${nombre}" → ${esValido ? "✅ Válido" : "❌ Inválido"}`);
  });

  // Test parsearNombreUruguayo
  console.log("\n🇺🇾 Test parsearNombreUruguayo:");
  const formatos = ["González, María José", "Rodríguez Silva, Juan Carlos", "Ana Lucía Fernández"];
  formatos.forEach((formato) => {
    const parseado = PersonaUtils.parsearNombreUruguayo(formato);
    console.log(`  "${formato}" → Nombres: "${parseado.nombres}", Apellidos: "${parseado.apellidos}"`);
  });
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testPersonaUtils();
}

export { testPersonaUtils };
