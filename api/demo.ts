import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiResponse, CiValidationData } from "../src/interfaces/ApiResponse";
import { LoteriaUyCiService } from "../src/services/CiService";
import { UruguayanCiValidator } from "../src/validators/CiValidator";

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
    const errorResponse: ApiResponse = {
      success: false,
      error: "Método no permitido. Use GET.",
      code: "METHOD_NOT_ALLOWED",
      timestamp: new Date().toISOString(),
    };
    return res.status(405).json(errorResponse);
  }

  try {
    // Cédula de ejemplo válida (esta es ficticia pero con formato correcto)
    const demoCi = "19119365";

    // Initialize validator and service
    const ciValidator = new UruguayanCiValidator();
    const ciService = new LoteriaUyCiService();

    const isValid = ciValidator.validate(demoCi);
    const normalizedCi = ciValidator.normalize(demoCi);

    let info: CiValidationData["info"] = "Cédula de demostración - Sin consulta real al servicio";

    // Si la cédula es válida, podemos intentar la consulta real
    if (isValid) {
      const queryResult = await ciService.queryCiInfo(normalizedCi);
      if (queryResult.success) {
        info = queryResult.data || info;
      }
    }

    const validationData: CiValidationData = {
      ci: demoCi,
      isValid: isValid,
      normalizedCi: normalizedCi,
      info: info,
    };

    const response: ApiResponse<CiValidationData> = {
      success: true,
      data: validationData,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en demo:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Error en el endpoint de demostración",
      code: "DEMO_ERROR",
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
}
