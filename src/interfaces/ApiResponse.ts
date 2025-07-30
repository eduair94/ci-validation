export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface CiValidationData {
  ci: string;
  isValid: boolean;
  normalizedCi: string;
  info?:
    | {
        persona: {
          nombre: string;
          apellido: string;
        };
        message: string;
        status: number;
      }
    | string;
}

export interface CiValidationRequest {
  ci: string;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime?: number;
  version?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}
