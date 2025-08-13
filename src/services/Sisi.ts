import axios, { AxiosResponse } from "axios";
import FormData from "form-data";

/**
 * Interface for Sisi API response
 */
export interface SisiResponse {
  success: boolean;
  hasUser: boolean;
  error?: string;
  userInfo?: {
    ci: string;
    country: string;
    status: "exists" | "not_found" | "error";
    message: string;
    executionTime: number;
  };
}

/**
 * Interface for Sisi request parameters
 */
export interface SisiRequest {
  ci: string;
  pais?: string; // Default: "001" (Uruguay)
}

/**
 * Sisi Service Class
 * Handles verification of users in the Sisi system (sisi.com.uy)
 *
 * This service checks if a user exists in the Sisi loyalty program
 * by making requests to their sisipuntos-consulta endpoint.
 */
export class SisiService {
  private readonly baseUrl = "https://sisi.com.uy";
  private readonly endpoint = "/sisipuntos-consulta";
  private readonly timeout = 10000; // 10 seconds timeout

  /**
   * Default headers for Sisi requests
   * Based on the original curl request
   */
  private getDefaultHeaders(): Record<string, string> {
    return {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "es-ES,es;q=0.9,bg;q=0.8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      Origin: "https://sisi.com.uy",
      Pragma: "no-cache",
      Referer: "https://sisi.com.uy/saldo",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    };
  }

  /**
   * Creates form data for the Sisi API request
   * @param ci - Cédula de identidad (without dots or dashes)
   * @param pais - Country code (default: "001" for Uruguay)
   * @returns FormData object
   */
  private createFormData(ci: string, pais: string = "001"): FormData {
    const formData = new FormData();
    formData.append("ci", ci);
    formData.append("pais", pais);
    return formData;
  }

  /**
   * Validates CI format before making the request
   * @param ci - Cédula de identidad
   * @returns boolean
   */
  private validateCI(ci: string): boolean {
    // Remove any non-numeric characters
    const cleanCi = ci.replace(/\D/g, "");

    // Check if it's between 7 and 8 digits
    return cleanCi.length >= 7 && cleanCi.length <= 8;
  }

  /**
   * Normalizes CI by removing any formatting
   * @param ci - Cédula de identidad
   * @returns Normalized CI string
   */
  private normalizeCI(ci: string): string {
    return ci.replace(/\D/g, "");
  }

  /**
   * Parses the Sisi API response to determine user existence
   * @param response - Axios response
   * @returns Parsed SisiResponse
   */
  private parseResponse(response: AxiosResponse, ci: string, country: string): SisiResponse {
    const executionTime = Date.now();

    try {
      const data = response.data;

      // Check if response indicates user exists based on message content
      const hasUser = this.determineUserExistence(data);
      const status = hasUser ? "exists" : "not_found";
      const message = this.extractMessage(data, hasUser);

      return {
        success: true,
        hasUser: hasUser,
        userInfo: {
          ci: ci,
          country: country,
          status: status,
          message: message,
          executionTime: executionTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        hasUser: false,
        error: `Error parsing response: ${error instanceof Error ? error.message : "Unknown error"}`,
        userInfo: {
          ci: ci,
          country: country,
          status: "error",
          message: "Error al procesar la respuesta del servidor",
          executionTime: executionTime,
        },
      };
    }
  }

  /**
   * Determines if user exists based on response message
   * @param data - Response data
   * @returns boolean indicating if user exists
   */
  private determineUserExistence(data: any): boolean {
    if (!data || !data.msg) {
      return false;
    }

    const message = data.msg.toLowerCase();

    // If message contains "no se encontro" or "registrate", user doesn't exist
    if (message.includes("no se encontro") || message.includes("registrate")) {
      return false;
    }

    // If message contains "debes loguearte", user exists but needs login
    if (message.includes("debes loguearte") || message.includes("loguearte")) {
      return true;
    }

    // Default to false for unknown responses
    return false;
  }

  /**
   * Extracts user-friendly message from response
   * @param data - Response data
   * @param hasUser - Whether user exists
   * @returns User-friendly message
   */
  private extractMessage(data: any, hasUser: boolean): string {
    if (hasUser) {
      return "Usuario registrado en el sistema Sisi (requiere login para más detalles)";
    } else {
      return "Usuario no encontrado en el sistema Sisi";
    }
  }

  /**
   * Checks if a user exists in the Sisi system
   * @param request - Sisi request parameters
   * @returns Promise<SisiResponse>
   */
  async checkUser(request: SisiRequest): Promise<SisiResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!request.ci) {
        throw new Error("CI (Cédula de Identidad) is required");
      }

      const normalizedCI = this.normalizeCI(request.ci);

      if (!this.validateCI(normalizedCI)) {
        throw new Error("CI must be between 7 and 8 digits");
      }

      // Prepare request data
      const formData = this.createFormData(normalizedCI, request.pais);
      const headers = {
        ...this.getDefaultHeaders(),
        ...formData.getHeaders(),
      };

      // Make the request
      const response = await axios.post(`${this.baseUrl}${this.endpoint}`, formData, {
        headers,
        timeout: this.timeout,
        validateStatus: (status) => status < 500, // Accept 4xx as valid responses
      });

      const executionTime = Date.now() - startTime;
      const result = this.parseResponse(response, normalizedCI, request.pais || "001");

      // Update execution time
      if (result.userInfo) {
        result.userInfo.executionTime = executionTime;
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        // Handle specific HTTP errors
        if (error.response?.status === 404) {
          return {
            success: true,
            hasUser: false,
            error: "User not found in Sisi system",
            userInfo: {
              ci: this.normalizeCI(request.ci),
              country: request.pais || "001",
              status: "not_found",
              message: "Usuario no encontrado en el sistema Sisi",
              executionTime: executionTime,
            },
          };
        }

        if (error.response?.status === 403 || error.response?.status === 401) {
          return {
            success: false,
            hasUser: false,
            error: "Access denied or authentication required",
            userInfo: {
              ci: this.normalizeCI(request.ci),
              country: request.pais || "001",
              status: "error",
              message: "Acceso denegado al sistema Sisi",
              executionTime: executionTime,
            },
          };
        }

        return {
          success: false,
          hasUser: false,
          error: `HTTP Error: ${error.response?.status} - ${error.message}`,
          userInfo: {
            ci: this.normalizeCI(request.ci),
            country: request.pais || "001",
            status: "error",
            message: "Error al consultar el sistema Sisi",
            executionTime: executionTime,
          },
        };
      }

      return {
        success: false,
        hasUser: false,
        error: `Network or system error: ${error instanceof Error ? error.message : "Unknown error"}`,
        userInfo: {
          ci: this.normalizeCI(request.ci),
          country: request.pais || "001",
          status: "error",
          message: "Error de conexión con el sistema Sisi",
          executionTime: executionTime,
        },
      };
    }
  }

  /**
   * Convenience method to check if a user exists by CI only
   * @param ci - Cédula de identidad
   * @returns Promise<boolean>
   */
  async hasUser(ci: string): Promise<boolean> {
    try {
      const result = await this.checkUser({ ci });
      return result.hasUser || false;
    } catch (error) {
      console.error("Error checking user in Sisi:", error);
      return false;
    }
  }
}

// Export a default instance
export default new SisiService();
