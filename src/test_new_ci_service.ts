import { ExternalCiService } from "./services/ExternalCiService";
async function main() {
  const ci = "49402245";
  await check(ci);
  //await check(ci);
}

async function check(ci: string) {
  const ciService = new ExternalCiService();
  const res = await ciService.getUserFriendlyInfo(ci);
  console.log("Res", JSON.stringify(res, null, 2));
}

main();
