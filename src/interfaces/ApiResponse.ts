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
  info?: string;
}

export interface CiValidationRequest {
  ci: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
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
