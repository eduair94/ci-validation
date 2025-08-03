import * as fs from "fs/promises";
import * as path from "path";
import { ProcessFieldSubmitFormatter, ProcessFieldSubmitRequest } from "../utils/processFieldSubmitFormatter";

/**
 * Script para extraer parámetros de processFieldSubmit del archivo curl.txt
 * y generar un JSON limpio con todos los valores
 */

interface ExtractedData {
  frmId: string;
  attId: string;
  value: string;
  rawValue?: string; // Para debugging
}

/**
 * Extrae los valores de un comando curl
 */
function extractFromCurlCommand(curlCommand: string): ExtractedData | null {
  try {
    // Extraer la URL del comando curl (manejar formato Windows con ^)
    const urlMatch = curlCommand.match(/curl \^?"([^"]+)/) || curlCommand.match(/curl "([^"]+)"/);
    if (!urlMatch) return null;

    let url = urlMatch[1];

    // Limpiar caracteres de escape de Windows (^)
    url = url.replace(/\^&/g, "&").replace(/\^"/g, '"').replace(/\^\^/g, "^");

    // Solo procesar URLs de processFieldSubmit
    if (!url.includes("action=processFieldSubmit")) return null;

    // Extraer frmId y attId de la URL
    const frmIdMatch = url.match(/frmId=([^&]+)/);
    const attIdMatch = url.match(/attId=([^&]+)/);

    if (!frmIdMatch || !attIdMatch) return null;

    const frmId = frmIdMatch[1];
    const attId = attIdMatch[1];

    // Extraer el valor del --data-raw (manejar formato Windows)
    let value = "";
    let rawValue = "";

    const dataRawMatch = curlCommand.match(/--data-raw \^?"([^"]*)\^?"/) || curlCommand.match(/--data-raw "([^"]*)"/);

    if (dataRawMatch) {
      rawValue = dataRawMatch[1];

      // Limpiar caracteres de escape de Windows
      rawValue = rawValue.replace(/\^%/g, "%").replace(/\^&/g, "&").replace(/\^"/g, '"').replace(/\^$/, "");

      // Decodificar el valor si está URL encoded
      if (rawValue.startsWith("value=")) {
        const encodedValue = rawValue.substring(6); // Remover 'value='
        try {
          value = decodeURIComponent(encodedValue.replace(/\^/g, ""));
        } catch {
          value = encodedValue.replace(/\^/g, ""); // Si falla la decodificación, usar el valor crudo sin ^
        }
      } else if (rawValue === "value=" || rawValue === "value=^" || rawValue === "^") {
        value = ""; // Valor vacío
      } else {
        // Limpiar caracteres ^ restantes
        value = rawValue.replace(/\^/g, "");
      }
    }

    return {
      frmId,
      attId,
      value,
      rawValue,
    };
  } catch (error) {
    console.error("Error extracting from curl command:", error);
    return null;
  }
}

/**
 * Función principal para procesar el archivo curl.txt
 */
async function processCurlFile(): Promise<void> {
  try {
    console.log("🔍 Procesando archivo curl.txt...\n");

    // Leer el archivo curl.txt
    const curlFilePath = path.join(process.cwd(), "curl.txt");
    const curlContent = await fs.readFile(curlFilePath, "utf-8");

    // Dividir en comandos individuales (buscar patrones de curl)
    const curlCommands = curlContent
      .split(/&\s*curl/)
      .map((cmd, index) => {
        // Agregar 'curl' al inicio si no es el primer comando
        if (index > 0 && !cmd.trim().startsWith("curl")) {
          return "curl" + cmd;
        }
        return cmd;
      })
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && cmd.includes("curl"));

    console.log(`📋 Encontrados ${curlCommands.length} comandos curl`);

    // Extraer datos de cada comando
    const extractedData: ExtractedData[] = [];
    let processedCount = 0;

    for (const command of curlCommands) {
      const data = extractFromCurlCommand(command);
      if (data) {
        extractedData.push(data);
        processedCount++;
        console.log(`✅ Extraído: frmId=${data.frmId}, attId=${data.attId}, value="${data.value}"`);
      }
    }

    console.log(`\n📊 Procesados ${processedCount} requests de processFieldSubmit`);

    // Convertir a formato limpio usando el formatter
    const requests = extractedData.map((data) => ({
      frmId: data.frmId,
      attId: data.attId,
      value: data.value,
    }));

    const cleanRequests = ProcessFieldSubmitFormatter.createMultipleRequests(requests);

    console.log(`\n🧹 Después de limpiar duplicados: ${cleanRequests.length} requests únicos`);

    // Crear el objeto final con metadata
    const finalResult = {
      metadata: {
        sourceFile: "curl.txt",
        extractedAt: new Date().toISOString(),
        totalCommands: curlCommands.length,
        processFieldSubmitCommands: processedCount,
        uniqueRequests: cleanRequests.length,
      },
      requests: cleanRequests,
      rawData: extractedData, // Para debugging
    };

    // Guardar en archivo JSON
    const outputPath = path.join(process.cwd(), "extracted-processFieldSubmit.json");
    await fs.writeFile(outputPath, JSON.stringify(finalResult, null, 2), "utf-8");

    console.log(`\n💾 Guardado en: ${outputPath}`);
    console.log("\n📋 Vista previa del JSON limpio:");
    console.log(ProcessFieldSubmitFormatter.toFormattedJson(cleanRequests));

    // También guardar solo los requests limpios en un archivo separado
    const cleanOutputPath = path.join(process.cwd(), "clean-processFieldSubmit.json");
    await fs.writeFile(cleanOutputPath, ProcessFieldSubmitFormatter.toFormattedJson(cleanRequests), "utf-8");

    console.log(`\n✨ Array limpio guardado en: ${cleanOutputPath}`);

    // Estadísticas finales
    console.log("\n📈 Estadísticas:");
    console.log(`- Comandos curl totales: ${curlCommands.length}`);
    console.log(`- Comandos processFieldSubmit: ${processedCount}`);
    console.log(`- Requests únicos finales: ${cleanRequests.length}`);
    console.log(`- Duplicados eliminados: ${processedCount - cleanRequests.length}`);
  } catch (error) {
    console.error("❌ Error procesando el archivo curl.txt:", error);
    throw error;
  }
}

// Función exportable para uso programático
export async function extractProcessFieldSubmitFromCurl(curlFilePath?: string): Promise<ProcessFieldSubmitRequest[]> {
  const filePath = curlFilePath || path.join(process.cwd(), "curl.txt");
  const curlContent = await fs.readFile(filePath, "utf-8");

  const curlCommands = curlContent
    .split(/&\s*curl/)
    .map((cmd, index) => {
      // Agregar 'curl' al inicio si no es el primer comando
      if (index > 0 && !cmd.trim().startsWith("curl")) {
        return "curl" + cmd;
      }
      return cmd;
    })
    .map((cmd) => cmd.trim())
    .filter((cmd) => cmd.length > 0 && cmd.includes("curl"));

  const extractedData: ExtractedData[] = [];

  for (const command of curlCommands) {
    const data = extractFromCurlCommand(command);
    if (data) {
      extractedData.push(data);
    }
  }

  const requests = extractedData.map((data) => ({
    frmId: data.frmId,
    attId: data.attId,
    value: data.value,
  }));

  return ProcessFieldSubmitFormatter.createMultipleRequests(requests);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  processCurlFile().catch(console.error);
}
