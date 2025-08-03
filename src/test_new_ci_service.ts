import fs from "fs";
import { NewCiService } from "./services/NewCiService";
async function main() {
  const ci = "19119365";
  await check(ci);
  //await check(ci);
}

async function check(ci: string) {
  await NewCiService.initializeSessionStorage();
  const ciService = new NewCiService();
  const res = await ciService.check(ci, { ignoreCache: true });
  console.log("Res", res);
}

async function cookieCheck(ci: string) {
  // Para que funcione se debe previamente elegir la persona física.
  const ciService = new NewCiService();
  const session = JSON.parse(fs.readFileSync("session.json", "utf-8"));
  const tabId = session.tabId;
  const tokenId = session.tokenId;
  const cookie = session.cookies;
  const res = await ciService.checkWithCookies(ci, cookie, tokenId, tabId);
  console.log("CI Check Result:", res);
}

main();
