import { DateUtils } from "../utils/dateUtils";

/**
 * Test básico para las funciones de DateUtils
 */
function testDateUtils() {
  console.log("=== Testing DateUtils ===");

  // Test casos exitosos
  const testCases = ["15/03/1990", "01/01/2000", "1990-03-15", "31-12-1985"];

  testCases.forEach((fechaString) => {
    console.log(`\nTesting: "${fechaString}"`);
    const resultado = DateUtils.procesarFechaNacimiento(fechaString);

    if (resultado) {
      console.log(`  ✅ Fecha Date: ${resultado.fechaDate.toLocaleDateString()}`);
      console.log(`  ✅ Edad: ${resultado.edad} años`);
    } else {
      console.log(`  ❌ No se pudo procesar la fecha`);
    }
  });

  // Test casos de error
  const errorCases = [
    "",
    "invalid-date",
    "32/13/2000", // fecha inválida
    "01/01/1800", // muy antigua
    "01/01/2030", // futura
  ];

  console.log("\n=== Testing Error Cases ===");
  errorCases.forEach((fechaString) => {
    console.log(`\nTesting error case: "${fechaString}"`);
    const resultado = DateUtils.procesarFechaNacimiento(fechaString);

    if (resultado === null) {
      console.log(`  ✅ Correctamente rechazado`);
    } else {
      console.log(`  ❌ Debería haber sido rechazado`);
    }
  });
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testDateUtils();
}

export { testDateUtils };
