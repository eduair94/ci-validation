import { ExternalCiService } from "./services/ExternalCiService";
async function main() {
  // Get CI from command line arguments
  const ci = process.argv[2];

  if (!ci) {
    console.error("Error: Debe proporcionar un número de cédula como argumento");
    console.log("Uso: npm run test_new_ci_service -- <numero_cedula>");
    console.log("Ejemplo: npm run test_new_ci_service -- 14115499");
    process.exit(1);
  }

  await check(ci);
}

async function check(ci: string) {
  const ciService = new ExternalCiService();
  const res = await ciService.getUserFriendlyInfo(ci);
  console.log("Res", JSON.stringify(res, null, 2));
}

main();
