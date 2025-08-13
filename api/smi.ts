import { VercelRequest, VercelResponse } from "@vercel/node";
import { SmiService, SmiRequest, SmiResponse } from "../src/services/Smi";
import { UruguayanCiValidator } from "../src/validators/CiValidator";

// Interface for API response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  executionTime: {
    total: number;
    validation: number;
    query?: number;
  };
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Start timing
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Allow both GET and POST methods
  if (req.method !== "POST" && req.method !== "GET") {
    const executionTime = Date.now() - startTime;
    const errorResponse: ApiResponse = {
      success: false,
      error: "Método no permitido. Use POST con body o GET con query parameter.",
      code: "METHOD_NOT_ALLOWED",
      timestamp: new Date().toISOString(),
      executionTime: {
        total: executionTime,
        validation: 0,
      },
    };
    return res.status(405).json(errorResponse);
  }

  try {
    // Get CI from body (POST) or query parameter (GET)
    let ci: string;

    if (req.method === "POST") {
      const body: SmiRequest = req.body;
      ci = body.ci;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: 'El campo "ci" es requerido en el body',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        };
        return res.status(400).json(errorResponse);
      }
    } else {
      // GET method
      ci = req.query.ci as string;

      if (!ci) {
        const executionTime = Date.now() - startTime;
        const errorResponse: ApiResponse = {
          success: false,
          error: 'El parámetro "ci" es requerido en la query string',
          code: "MISSING_CI",
          timestamp: new Date().toISOString(),
          executionTime: {
            total: executionTime,
            validation: 0,
          },
        };
        return res.status(400).json(errorResponse);
      }
    }

    // Initialize validator and service
    const ciValidator = new UruguayanCiValidator();
    const smiService = new SmiService();

    // Start validation timing
    const validationStartTime = Date.now();

    // Validar formato básico
    if (!ciValidator.validateFormat(ci)) {
      const executionTime = Date.now() - startTime;
      const validationTime = Date.now() - validationStartTime;
      const errorResponse: ApiResponse = {
        success: false,
        error: "Formato de cédula inválido. Debe contener entre 7 y 8 dígitos numéricos",
        code: "INVALID_FORMAT",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: executionTime,
          validation: validationTime,
        },
      };
      return res.status(400).json(errorResponse);
    }

    // Validar cédula completa
    const isValid = ciValidator.validate(ci);

    if (!isValid) {
      const executionTime = Date.now() - startTime;
      const validationTime = Date.now() - validationStartTime;
      const errorResponse: ApiResponse = {
        success: false,
        error: "Cédula inválida: dígito verificador incorrecto",
        code: "INVALID_CI",
        timestamp: new Date().toISOString(),
        executionTime: {
          total: executionTime,
          validation: validationTime,
        },
      };
      return res.status(400).json(errorResponse);
    }

    // End validation timing, start query timing
    const validationTime = Date.now() - validationStartTime;
    const queryStartTime = Date.now();

    // Consultar información de SMI
    const normalizedCi = ciValidator.normalize(ci);
    const smiResult: SmiResponse = await smiService.checkUser({ ci: normalizedCi });

    // End query timing
    const queryTime = Date.now() - queryStartTime;
    const totalExecutionTime = Date.now() - startTime;

    // Prepare response
    const response: ApiResponse<SmiResponse> = {
      success: true,
      data: smiResult,
      timestamp: new Date().toISOString(),
      executionTime: {
        total: totalExecutionTime,
        validation: validationTime,
        query: queryTime,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en endpoint SMI:", error);

    const totalExecutionTime = Date.now() - startTime;
    const errorResponse: ApiResponse = {
      success: false,
      error: "Error interno del servidor al consultar SMI",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
      executionTime: {
        total: totalExecutionTime,
        validation: 0,
      },
    };

    return res.status(500).json(errorResponse);
  }
}
