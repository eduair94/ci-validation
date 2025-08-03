import { ProcessFieldSubmitFormatter } from "../utils/processFieldSubmitFormatter";

// Ejemplos de uso del ProcessFieldSubmitFormatter

console.log("=== Ejemplo 1: Crear un request simple ===");
const singleRequest = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");
console.log("Request individual:");
console.log(ProcessFieldSubmitFormatter.toFormattedJson(singleRequest));

console.log("\n=== Ejemplo 2: Crear múltiples requests eliminando duplicados ===");
const multipleRequests = [
  { frmId: "6687", attId: "12295", value: "1" },
  { frmId: "6368", attId: "1929", value: "" },
  { frmId: "6368", attId: "1569", value: "1" },
  { frmId: "6687", attId: "12295", value: "1" }, // Duplicado - será eliminado
  { frmId: "6368", attId: "1239", value: "Consulta/Reclamación" },
  { frmId: "6368", attId: "1929", value: "updated" }, // Actualizará el valor vacío anterior
];

const cleanRequests = ProcessFieldSubmitFormatter.createMultipleRequests(multipleRequests);
console.log("Requests múltiples (sin duplicados, ordenados):");
console.log(ProcessFieldSubmitFormatter.toFormattedJson(cleanRequests));

console.log("\n=== Ejemplo 3: Extraer parámetros de URL ===");
const sampleUrl = "https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run?action=processFieldSubmit&isAjax=true&react=true&tabId=1754182283786&tokenId=1754182283743&timestamp=1754182367411&attId=1929&frmId=6368&index=0&frmParent=E&timestamp=1754182367410";

const extractedRequest = ProcessFieldSubmitFormatter.extractFromUrl(sampleUrl);
if (extractedRequest) {
  console.log("Parámetros extraídos de URL:");
  console.log(ProcessFieldSubmitFormatter.toFormattedJson(extractedRequest));
}

console.log("\n=== Ejemplo 4: Validar estructura de request ===");
const validRequest = { frmId: "6687", attId: "12295", value: "1" };
const invalidRequest = { frmId: "6687", attId: "12295" }; // Falta 'value'

console.log("¿Request válido?", ProcessFieldSubmitFormatter.isValidRequest(validRequest));
console.log("¿Request inválido?", ProcessFieldSubmitFormatter.isValidRequest(invalidRequest));

console.log("\n=== Ejemplo 5: Formato específico solicitado ===");
const specificRequest = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");
console.log("Formato específico requerido:");
console.log(ProcessFieldSubmitFormatter.toFormattedJson(specificRequest, 0)); // Sin indentación para formato compacto
