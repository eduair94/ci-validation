import rateLimit from "express-rate-limit";

/**
 * Configuración de rate limiting para la API
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000000, // Máximo 1000000 requests por ventana de tiempo
  message: {
    success: false,
    error: "Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos",
    code: "RATE_LIMIT_EXCEEDED",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Retorna información de rate limit en headers
  legacyHeaders: false, // Deshabilita headers X-RateLimit-*
  // Función para generar clave única por IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
});
