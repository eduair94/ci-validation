/**
 * Utility function to extract proInstId and proEleInstId from XML response
 */

/**
 * Extrae proInstId y proEleInstId de una respuesta XML
 * @param xmlResponse - La respuesta XML que contiene la URL con los parámetros
 * @returns Objeto con proInstId y proEleInstId extraídos
 */
export function extractProcessInstanceIds(xmlResponse: string): { proInstId: string; proEleInstId: string } | null {
  try {
    console.log(`🔍 Extracting process instance IDs from XML response...`);

    // Buscar el atributo url en el XML
    const urlMatch = xmlResponse.match(/url="([^"]+)"/);
    if (!urlMatch) {
      console.error("❌ No URL attribute found in XML response");
      return null;
    }

    let url = urlMatch[1];

    // Decodificar entidades HTML (&amp; -> &)
    url = url.replace(/&amp;/g, "&");

    console.log(`📡 Extracted URL: ${url}`);

    // Extraer proInstId y proEleInstId usando regex
    const proInstIdMatch = url.match(/proInstId=([^&]+)/);
    const proEleInstIdMatch = url.match(/proEleInstId=([^&]+)/);

    if (!proInstIdMatch || !proEleInstIdMatch) {
      console.error("❌ proInstId or proEleInstId not found in URL");
      return null;
    }

    const result = {
      proInstId: proInstIdMatch[1],
      proEleInstId: proEleInstIdMatch[1],
    };

    console.log(`✅ Extracted process IDs:`, result);
    return result;
  } catch (error) {
    console.error("❌ Error extracting process instance IDs:", error);
    return null;
  }
}

// Test the function
console.log("🧪 Testing extractProcessInstanceIds function\n");

// Test case 1: XML response válido
const xmlResponse1 = '<?xml version="1.0" encoding="iso-8859-1"?><result url="apia.execution.TaskAction.run?action=getTask&amp;proInstId=83432&amp;proEleInstId=4358057&amp;fromWizzard=true&amp;tabId=1754188254534&amp;tokenId=1754188254448" />';

console.log("Test 1 - XML response válido:");
const result1 = extractProcessInstanceIds(xmlResponse1);
console.log("Result:", result1);

console.log("\n" + "=".repeat(50) + "\n");

// Test case 2: XML con diferentes valores
const xmlResponse2 = '<?xml version="1.0" encoding="iso-8859-1"?><result url="apia.execution.TaskAction.run?action=getTask&amp;proInstId=12345&amp;proEleInstId=67890&amp;fromWizzard=true&amp;tabId=9999&amp;tokenId=8888" />';

console.log("Test 2 - XML con diferentes valores:");
const result2 = extractProcessInstanceIds(xmlResponse2);
console.log("Result:", result2);

console.log("\n" + "=".repeat(50) + "\n");

// Test case 3: Formato JSON para uso fácil
console.log("Example JSON format for integration:");
if (result1) {
  const jsonFormat = {
    processInstanceIds: result1,
    extractedAt: new Date().toISOString(),
    source: "XML response extraction",
  };

  console.log(JSON.stringify(jsonFormat, null, 2));
}
