import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../interfaces/ApiResponse";

export class ErrorHandler {
  /**
   * Middleware para manejo global de errores
   */
  static globalErrorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error("Error no manejado:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }

  /**
   * Middleware para rutas no encontradas
   */
  static notFoundHandler(req: Request, res: Response): void {
    const errorResponse: ApiResponse = {
      success: false,
      error: `Ruta no encontrada: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
      timestamp: new Date().toISOString(),
    };

    res.status(404).json(errorResponse);
  }
}
