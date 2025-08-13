import { VercelRequest, VercelResponse } from "@vercel/node";

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
    const response = {
      name: "API de Validación de Cédulas Uruguayas",
      version: "1.0.0",
      description: "API para validar cédulas de identidad uruguayas",
      endpoints: {
        health: "GET /health",
        validate: "POST /api/validate (body) | GET /api/validate?ci=xxx (query)",
        smi: "POST /api/smi (body) | GET /api/smi?ci=xxx (query)",
        demo: "GET /api/demo",
        demoPage: "GET /demo",
        docs: "GET /api-docs",
        swaggerJson: "GET /api/swagger.json",
      },
      documentation: "Ver README.md para más información",
      demoUrl: "/demo",
      docsUrl: "/api-docs",
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en index:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
