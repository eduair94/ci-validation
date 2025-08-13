import axios, { AxiosResponse } from "axios";

// Request interface for Forum API
export interface ForumRequest {
  ci: string;
}

// Response interface for Forum API
export interface ForumMember {
  ci: string;
  idCliente: string;
  status: "active" | "no_points" | "not_registered";
  executionTime: number;
}

export interface ForumPoints {
  available: number;
  minimumExchange: number;
}

export interface ForumResponse {
  success: boolean;
  hasUser: boolean;
  member?: ForumMember;
  points?: ForumPoints;
  error?: string;
}

// Raw API response interface
interface ForumApiResponse {
  error: boolean;
  message: string;
  idCliente: string;
  puntos: number;
  minimoCanje?: number;
}

export class ForumService {
  private readonly baseUrl = "https://www.forum.com.uy/puntos/consulta";

  private readonly headers = {
    Accept: "*/*",
    "Accept-Language": "es-ES,es;q=0.9,bg;q=0.8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Origin: "https://www.forum.com.uy",
    Pragma: "no-cache",
    Referer: "https://www.forum.com.uy/puntos",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  };

  /**
   * Check member status and points in Forum loyalty program
   * @param request - Object containing the CI
   * @returns Promise with Forum response data
   */
  async checkMember(request: ForumRequest): Promise<ForumResponse> {
    const startTime = Date.now();

    try {
      const payload = {
        documento: request.ci,
        recaptcha: "logged in",
      };

      const response: AxiosResponse<ForumApiResponse> = await axios.post(this.baseUrl, payload, { headers: this.headers });

      return this.parseResponse(response.data, request.ci, Date.now() - startTime);
    } catch (error) {
      return {
        success: false,
        hasUser: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Parse the raw API response into our standardized format
   * @param apiResponse - Raw response from Forum API
   * @param ci - The CI number that was queried
   * @param executionTime - Time taken for the request
   * @returns Parsed ForumResponse
   */
  private parseResponse(apiResponse: ForumApiResponse, ci: string, executionTime: number): ForumResponse {
    if (apiResponse.error) {
      // Check different error types
      if (apiResponse.message.includes("no tiene puntos disponibles")) {
        // User exists but has no points
        return {
          success: true,
          hasUser: true,
          member: {
            ci,
            idCliente: apiResponse.idCliente || "",
            status: "no_points",
            executionTime,
          },
          points: {
            available: 0,
            minimumExchange: apiResponse.minimoCanje || 0,
          },
        };
      } else if (apiResponse.message.includes("No se encontró un cliente")) {
        // User not registered
        return {
          success: true,
          hasUser: false,
          error: "Usuario no registrado en el programa Forum",
        };
      } else {
        // Other error
        return {
          success: false,
          hasUser: false,
          error: apiResponse.message.replace(/<[^>]*>/g, ""), // Remove HTML tags
        };
      }
    } else {
      // Success case - user has points
      return {
        success: true,
        hasUser: true,
        member: {
          ci,
          idCliente: apiResponse.idCliente,
          status: "active",
          executionTime,
        },
        points: {
          available: apiResponse.puntos,
          minimumExchange: apiResponse.minimoCanje || 0,
        },
      };
    }
  }

  /**
   * Check if user exists in the Forum system
   * @param request - Object containing the CI
   * @returns Promise with boolean indicating if user exists
   */
  async hasUser(request: ForumRequest): Promise<boolean> {
    const response = await this.checkMember(request);
    return response.hasUser;
  }

  /**
   * Get user points if available
   * @param request - Object containing the CI
   * @returns Promise with points or null if not available
   */
  async getPoints(request: ForumRequest): Promise<number | null> {
    const response = await this.checkMember(request);
    return response.points?.available || null;
  }

  /**
   * Get member information
   * @param request - Object containing the CI
   * @returns Promise with member data or null if not found
   */
  async getMember(request: ForumRequest): Promise<ForumMember | null> {
    const response = await this.checkMember(request);
    return response.member || null;
  }
}
