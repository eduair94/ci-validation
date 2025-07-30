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
    let swaggerDocument;

    try {
      const swaggerContent = fs.readFileSync(swaggerPath, "utf8");
      swaggerDocument = JSON.parse(swaggerContent);
    } catch (error) {
      console.error("Error reading swagger.json:", error);
      return res.status(404).json({
        error: "Documentación no encontrada",
        code: "DOCS_NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }

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

    // Generate Swagger UI HTML
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API de Validación de Cédulas Uruguayas - Documentación</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '${baseUrl}/api/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: 'list',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(swaggerHtml);
  } catch (error) {
    console.error("Error en api-docs:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
}
