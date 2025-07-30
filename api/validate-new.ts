import { VercelRequest, VercelResponse } from "@vercel/node";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    // Import dependencies dynamically to avoid cold start issues
    const { DependencyContainer } = await import("../src/utils/dependencyContainer");

    const container = DependencyContainer.getInstance();
    const ciController = container.getCiController();

    // Handle both GET and POST methods
    if (req.method === "GET") {
      // Use the query parameter method
      await ciController.validateCiQuery(req as any, res as any);
    } else if (req.method === "POST") {
      // Use the body method
      await ciController.validateCi(req as any, res as any);
    } else {
      return res.status(405).json({
        success: false,
        error: "Método no permitido. Use GET con query parameter o POST con body",
        code: "METHOD_NOT_ALLOWED",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error en validate:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
}
