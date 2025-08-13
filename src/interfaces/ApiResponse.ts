export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  executionTime?: {
    total: number; // Total execution time in milliseconds
    validation: number; // Time spent on CI validation
    query?: number; // Time spent on external query (if applicable)
  };
}

export interface CiValidationData {
  ci: string;
  isValid: boolean;
  normalizedCi: string;
  info?:
    | {
        persona: {
          nombre: string;
        };
        message: string;
        status: number;
      }
    | any;
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
