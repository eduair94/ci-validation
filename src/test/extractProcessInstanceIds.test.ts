import { NewCiService } from "../services/NewCiService";

/**
 * Test para la función extractProcessInstanceIds
 */

// Crear una instancia de NewCiService para acceder al método
const service = new NewCiService();

// Hacer público el método privado para testing
const extractProcessInstanceIds = (service as any).extractProcessInstanceIds.bind(service);

console.log("🧪 Testing extractProcessInstanceIds function\n");

// Test case 1: XML response válido
const xmlResponse1 = '<?xml version="1.0" encoding="iso-8859-1"?><result url="apia.execution.TaskAction.run?action=getTask&amp;proInstId=83432&amp;proEleInstId=4358057&amp;fromWizzard=true&amp;tabId=1754188254534&amp;tokenId=1754188254448" />';

console.log("Test 1 - XML response válido:");
console.log("Input:", xmlResponse1);
const result1 = extractProcessInstanceIds(xmlResponse1);
console.log("Output:", result1);
console.log('Expected: { proInstId: "83432", proEleInstId: "4358057" }');
console.log("✅ Test 1 passed:", JSON.stringify(result1) === JSON.stringify({ proInstId: "83432", proEleInstId: "4358057" }));

console.log("\n" + "=".repeat(60) + "\n");

// Test case 2: XML con diferentes valores
const xmlResponse2 = '<?xml version="1.0" encoding="iso-8859-1"?><result url="apia.execution.TaskAction.run?action=getTask&amp;proInstId=12345&amp;proEleInstId=67890&amp;fromWizzard=true&amp;tabId=9999&amp;tokenId=8888" />';

console.log("Test 2 - XML con diferentes valores:");
console.log("Input:", xmlResponse2);
const result2 = extractProcessInstanceIds(xmlResponse2);
console.log("Output:", result2);
console.log('Expected: { proInstId: "12345", proEleInstId: "67890" }');
console.log("✅ Test 2 passed:", JSON.stringify(result2) === JSON.stringify({ proInstId: "12345", proEleInstId: "67890" }));

console.log("\n" + "=".repeat(60) + "\n");

// Test case 3: XML inválido (sin URL)
const xmlResponse3 = '<?xml version="1.0" encoding="iso-8859-1"?><result status="error" />';

console.log("Test 3 - XML sin URL:");
console.log("Input:", xmlResponse3);
const result3 = extractProcessInstanceIds(xmlResponse3);
console.log("Output:", result3);
console.log("Expected: null");
console.log("✅ Test 3 passed:", result3 === null);

console.log("\n" + "=".repeat(60) + "\n");

// Test case 4: XML con parámetros faltantes
const xmlResponse4 = '<?xml version="1.0" encoding="iso-8859-1"?><result url="apia.execution.TaskAction.run?action=getTask&amp;fromWizzard=true&amp;tabId=1754188254534&amp;tokenId=1754188254448" />';

console.log("Test 4 - XML con parámetros faltantes:");
console.log("Input:", xmlResponse4);
const result4 = extractProcessInstanceIds(xmlResponse4);
console.log("Output:", result4);
console.log("Expected: null");
console.log("✅ Test 4 passed:", result4 === null);

console.log("\n" + "=".repeat(60) + "\n");

// Test case 5: Formato JSON para uso fácil
console.log("Test 5 - Ejemplo de uso en formato JSON:");
if (result1) {
  const jsonFormat = {
    processInstanceIds: result1,
    timestamp: new Date().toISOString(),
    source: "XML response extraction",
  };

  console.log("JSON format for easy use:");
  console.log(JSON.stringify(jsonFormat, null, 2));
}

console.log("\n🎉 All tests completed!");

// Exportar función para uso externo
export { extractProcessInstanceIds };
