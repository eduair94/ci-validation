import { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Read the HTML file
    const htmlPath = join(process.cwd(), "public", "index.html");
    const htmlContent = readFileSync(htmlPath, "utf-8");

    // Set proper headers
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=86400");

    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Error serving demo page:", error);
    return res.status(500).json({ error: "Could not load demo page" });
  }
}
