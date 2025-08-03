#!/usr/bin/env node

import { ProcessFieldSubmitFormatter } from "../utils/processFieldSubmitFormatter";

/**
 * Script para generar JSON limpio de requests processFieldSubmit
 * Uso desde CLI: node generateProcessFieldSubmitJson.js
 */

// Función principal para generar el JSON
function generateCleanJson() {
  console.log("🚀 Generador JSON para processFieldSubmit\n");

  // Ejemplo del formato solicitado
  const exampleRequest = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");

  console.log("📋 Formato requerido:");
  console.log(ProcessFieldSubmitFormatter.toFormattedJson(exampleRequest));

  console.log("\n" + "=".repeat(50));

  // Ejemplo con múltiples requests de los curl commands
  const curlRequests = [
    { frmId: "6368", attId: "1929", value: "" },
    { frmId: "6368", attId: "1569", value: "1" },
    { frmId: "6368", attId: "1239", value: "Consulta/Reclamación o Denuncia en Materia de Relaciones de Consumo" },
    { frmId: "6368", attId: "1604", value: "" },
    { frmId: "6368", attId: "1924", value: "SI" },
    { frmId: "6368", attId: "1269", value: "Eduardo" },
    { frmId: "6368", attId: "1925", value: "Raul" },
    { frmId: "6368", attId: "1570", value: "35829046" },
    { frmId: "6368", attId: "10993", value: "eduair94@gmail.com" },
    { frmId: "6368", attId: "1265", value: "54" },
    { frmId: "6368", attId: "1270", value: "099123456" },
    { frmId: "6368", attId: "3957", value: "MONTEVIDEO" },
    { frmId: "6368", attId: "7378", value: "MONTEVIDEO" },
    { frmId: "6368", attId: "1594", value: "Calle Ejemplo 123" },
    { frmId: "6368", attId: "5513", value: "" },
    { frmId: "6368", attId: "5514", value: "" },
    { frmId: "6368", attId: "5522", value: "" },
    { frmId: "6368", attId: "10992", value: "" },
    { frmId: "6368", attId: "10989", value: "" },
    { frmId: "6368", attId: "10991", value: "" },
    { frmId: "6368", attId: "10990", value: "" },
  ];

  const cleanRequests = ProcessFieldSubmitFormatter.createMultipleRequests(curlRequests);

  console.log("📦 Array de requests limpios (sin duplicados, ordenados):");
  console.log(ProcessFieldSubmitFormatter.toFormattedJson(cleanRequests));

  console.log("\n" + "=".repeat(50));

  // Generar requests individuales para casos específicos
  const specificRequests = [ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1"), ProcessFieldSubmitFormatter.createRequest("6368", "1569", "1"), ProcessFieldSubmitFormatter.createRequest("6368", "1924", "SI")];

  console.log("🎯 Requests específicos:");
  specificRequests.forEach((request, index) => {
    console.log(`\nRequest ${index + 1}:`);
    console.log(ProcessFieldSubmitFormatter.toFormattedJson(request));
  });

  console.log("\n" + "=".repeat(50));

  // Formato compacto (una línea)
  console.log("💡 Formato compacto para el request ejemplo:");
  console.log(JSON.stringify(exampleRequest));

  console.log("\n✅ ¡Generación completa!\n");
}

// Función para uso programático
export function createProcessFieldSubmitJson(frmId: string, attId: string, value: string) {
  return ProcessFieldSubmitFormatter.createRequest(frmId, attId, value);
}

// Función para crear múltiples requests limpios
export function createMultipleProcessFieldSubmitJson(requests: Array<{ frmId: string; attId: string; value: string }>) {
  return ProcessFieldSubmitFormatter.createMultipleRequests(requests);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateCleanJson();
}

// Exportar funciones útiles
export { ProcessFieldSubmitFormatter };
