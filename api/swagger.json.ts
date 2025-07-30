import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    // Read swagger.json file
    const swaggerPath = path.join(process.cwd(), "swagger.json");
    
    try {
      const swaggerContent = fs.readFileSync(swaggerPath, "utf8");
      const swaggerDocument = JSON.parse(swaggerContent);

      // Update server URLs for the current deployment
      const host = req.headers.host;
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const baseUrl = `${protocol}://${host}`;

      swaggerDocument.servers = [
        {
          url: baseUrl,
          description: "Current deployment",
        },
        {
          url: "http://localhost:3200",
          description: "Development server",
        },
      ];

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(swaggerDocument);
    } catch (error) {
      console.error("Error reading swagger.json:", error);
      return res.status(404).json({
        error: "Documentación no encontrada",
        code: "DOCS_NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error en swagger.json:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
}
