import * as fs from "fs/promises";
import { ProcessFieldSubmitFormatter } from "../utils/processFieldSubmitFormatter";

/**
 * Genera ejemplos específicos en el formato solicitado
 */
async function generateSpecificExamples() {
  console.log("🎯 Generando ejemplos específicos del formato solicitado\n");

  // Leer el JSON limpio generado
  const cleanData = JSON.parse(await fs.readFile("clean-processFieldSubmit.json", "utf-8"));

  // Encontrar el ejemplo específico mencionado (frmId: "6687", attId: "12295", value: "1")
  const specificExample = cleanData.find((item: any) => item.frmId === "6687" && item.attId === "12295");

  if (specificExample) {
    console.log("✅ Ejemplo específico encontrado en los datos extraídos:");
    console.log(ProcessFieldSubmitFormatter.toFormattedJson(specificExample));
    console.log("\n📋 Formato compacto:");
    console.log(JSON.stringify(specificExample));
  }

  // Mostrar algunos otros ejemplos interesantes
  console.log("\n🔍 Otros ejemplos interesantes:");

  const interestingExamples = [cleanData.find((item: any) => item.value === "SI"), cleanData.find((item: any) => item.value.includes("Consulta")), cleanData.find((item: any) => item.value.includes("@mail.com")), cleanData.find((item: any) => item.value === "1" && item.frmId === "6368")].filter(Boolean);

  interestingExamples.forEach((example, index) => {
    console.log(`\nEjemplo ${index + 1}:`);
    console.log(ProcessFieldSubmitFormatter.toFormattedJson(example));
  });

  // Generar archivo con solo algunos ejemplos representativos
  const representativeExamples = [ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1"), ProcessFieldSubmitFormatter.createRequest("6368", "1924", "SI"), ProcessFieldSubmitFormatter.createRequest("6368", "1569", "1"), ProcessFieldSubmitFormatter.createRequest("6368", "1269", "dfadsfds@mail.com")];

  await fs.writeFile("representative-examples.json", ProcessFieldSubmitFormatter.toFormattedJson(representativeExamples), "utf-8");

  console.log("\n💾 Ejemplos representativos guardados en: representative-examples.json");
  console.log("\n🎉 ¡Proceso completado exitosamente!");
}

if (require.main === module) {
  generateSpecificExamples().catch(console.error);
}
