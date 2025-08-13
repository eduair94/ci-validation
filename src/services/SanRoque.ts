import axios, { AxiosResponse } from 'axios';

/**
 * Interface for San Roque member data
 */
export interface SanRoqueMember {
  tipoDocumento: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
}

/**
 * Interface for San Roque points data
 */
export interface SanRoquePoints {
  puntosDisponibles: string;
  vencimiento30: string;
  vencimiento60?: string;
  vencimiento90?: string;
  [key: string]: string | undefined; // For any additional point fields
}

/**
 * Interface for San Roque API response
 */
export interface SanRoqueApiResponse {
  socio?: SanRoqueMember;
  puntos?: SanRoquePoints;
  error?: string;
}

/**
 * Interface for San Roque service response
 */
export interface SanRoqueResponse {
  success: boolean;
  hasUser: boolean;
  error?: string;
  member?: {
    ci: string;
    documentType: string;
    firstName: string;
    lastName: string;
    email: string;
    status: 'active' | 'inactive' | 'unknown';
    executionTime: number;
  };
  points?: {
    available: number;
    expiring30Days: number;
    expiring60Days?: number;
    expiring90Days?: number;
    total: number;
  };
}

/**
 * Interface for San Roque request parameters
 */
export interface SanRoqueRequest {
  ci: string;
  documentType?: string; // Default: "CI"
}

/**
 * San Roque Service Class
 * Handles member validation and points query for Tarjeta San Roque (tarjetasanroque.com.uy)
 * 
 * This service checks if a user is a member of the San Roque loyalty program
 * and retrieves their points information.
 */
export class SanRoqueService {
  private readonly baseUrl = 'https://api.tarjetasanroque.com.uy';
  private readonly endpoint = '/api/public/member-validation';
  private readonly timeout = 10000; // 10 seconds timeout

  /**
   * Default headers for San Roque requests
   * Based on the original curl request
   */
  private getDefaultHeaders(): Record<string, string> {
    return {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'es-ES,es;q=0.9,bg;q=0.8',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'origin': 'https://tarjetasanroque.com.uy',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://tarjetasanroque.com.uy/',
      'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
    };
  }

  /**
   * Creates request payload for the San Roque API
   * @param ci - Cédula de identidad (without dots or dashes)
   * @param documentType - Document type (default: "CI")
   * @returns Request payload object
   */
  private createRequestPayload(ci: string, documentType: string = 'CI'): object {
    return {
      documentType: documentType,
      documentNumber: parseInt(ci, 10) // Convert to number as expected by API
    };
  }

  /**
   * Validates CI format before making the request
   * @param ci - Cédula de identidad
   * @returns boolean
   */
  private validateCI(ci: string): boolean {
    // Remove any non-numeric characters
    const cleanCi = ci.replace(/\D/g, '');
    
    // Check if it's between 7 and 8 digits
    return cleanCi.length >= 7 && cleanCi.length <= 8;
  }

  /**
   * Normalizes CI by removing any formatting
   * @param ci - Cédula de identidad
   * @returns Normalized CI string
   */
  private normalizeCI(ci: string): string {
    return ci.replace(/\D/g, '');
  }

  /**
   * Converts string numbers to actual numbers, handling empty strings
   * @param value - String value that might be a number
   * @returns Number or 0 if invalid
   */
  private parsePoints(value: string): number {
    if (!value || value.trim() === '') {
      return 0;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Parses the San Roque API response
   * @param response - Axios response
   * @param ci - Original CI for context
   * @returns Parsed SanRoqueResponse
   */
  private parseResponse(response: AxiosResponse, ci: string): SanRoqueResponse {
    const executionTime = Date.now();
    
    try {
      const data: SanRoqueApiResponse = response.data;

      // Check if there's an error in the response
      if (data.error) {
        return {
          success: true, // API call was successful, but user not found
          hasUser: false,
          error: data.error,
          member: {
            ci: ci,
            documentType: 'CI',
            firstName: '',
            lastName: '',
            email: '',
            status: 'unknown',
            executionTime: executionTime
          }
        };
      }

      // If we have member data, user exists
      if (data.socio) {
        const member = data.socio;
        const points = data.puntos;

        // Parse points information
        const availablePoints = points ? this.parsePoints(points.puntosDisponibles) : 0;
        const expiring30 = points ? this.parsePoints(points.vencimiento30) : 0;
        const expiring60 = points && points.vencimiento60 ? this.parsePoints(points.vencimiento60) : undefined;
        const expiring90 = points && points.vencimiento90 ? this.parsePoints(points.vencimiento90) : undefined;

        return {
          success: true,
          hasUser: true,
          member: {
            ci: member.cedula,
            documentType: member.tipoDocumento,
            firstName: member.nombres || '',
            lastName: member.apellidos || '',
            email: member.email || '',
            status: member.estado?.toLowerCase() === 'activo' ? 'active' : 
                   member.estado?.toLowerCase() === 'inactivo' ? 'inactive' : 'unknown',
            executionTime: executionTime
          },
          points: {
            available: availablePoints,
            expiring30Days: expiring30,
            expiring60Days: expiring60,
            expiring90Days: expiring90,
            total: availablePoints + expiring30 + (expiring60 || 0) + (expiring90 || 0)
          }
        };
      }

      // No member data and no error - unexpected response
      return {
        success: false,
        hasUser: false,
        error: 'Respuesta inesperada del servidor',
        member: {
          ci: ci,
          documentType: 'CI',
          firstName: '',
          lastName: '',
          email: '',
          status: 'unknown',
          executionTime: executionTime
        }
      };

    } catch (error) {
      return {
        success: false,
        hasUser: false,
        error: `Error parsing response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        member: {
          ci: ci,
          documentType: 'CI',
          firstName: '',
          lastName: '',
          email: '',
          status: 'unknown',
          executionTime: executionTime
        }
      };
    }
  }

  /**
   * Checks if a user is a member of San Roque and retrieves their information
   * @param request - San Roque request parameters
   * @returns Promise<SanRoqueResponse>
   */
  async checkMember(request: SanRoqueRequest): Promise<SanRoqueResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!request.ci) {
        throw new Error('CI (Cédula de Identidad) is required');
      }

      const normalizedCI = this.normalizeCI(request.ci);
      
      if (!this.validateCI(normalizedCI)) {
        throw new Error('CI must be between 7 and 8 digits');
      }

      // Prepare request
      const payload = this.createRequestPayload(normalizedCI, request.documentType);
      const headers = this.getDefaultHeaders();

      // Make the request
      const response = await axios.post(
        `${this.baseUrl}${this.endpoint}`,
        payload,
        {
          headers,
          timeout: this.timeout,
          validateStatus: (status) => status < 500 // Accept 4xx as valid responses
        }
      );

      const result = this.parseResponse(response, normalizedCI);
      
      // Update execution time
      if (result.member) {
        result.member.executionTime = Date.now() - startTime;
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
            error: 'Member not found in San Roque system',
            member: {
              ci: this.normalizeCI(request.ci),
              documentType: request.documentType || 'CI',
              firstName: '',
              lastName: '',
              email: '',
              status: 'unknown',
              executionTime: executionTime
            }
          };
        }

        if (error.response?.status === 403 || error.response?.status === 401) {
          return {
            success: false,
            hasUser: false,
            error: 'Access denied or authentication required',
            member: {
              ci: this.normalizeCI(request.ci),
              documentType: request.documentType || 'CI',
              firstName: '',
              lastName: '',
              email: '',
              status: 'unknown',
              executionTime: executionTime
            }
          };
        }

        return {
          success: false,
          hasUser: false,
          error: `HTTP Error: ${error.response?.status} - ${error.message}`,
          member: {
            ci: this.normalizeCI(request.ci),
            documentType: request.documentType || 'CI',
            firstName: '',
            lastName: '',
            email: '',
            status: 'unknown',
            executionTime: executionTime
          }
        };
      }

      return {
        success: false,
        hasUser: false,
        error: `Network or system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        member: {
          ci: this.normalizeCI(request.ci),
          documentType: request.documentType || 'CI',
          firstName: '',
          lastName: '',
          email: '',
          status: 'unknown',
          executionTime: executionTime
        }
      };
    }
  }

  /**
   * Convenience method to check if a user is a member by CI only
   * @param ci - Cédula de identidad
   * @returns Promise<boolean>
   */
  async isMember(ci: string): Promise<boolean> {
    try {
      const result = await this.checkMember({ ci });
      return result.hasUser || false;
    } catch (error) {
      console.error('Error checking member in San Roque:', error);
      return false;
    }
  }

  /**
   * Get member points from San Roque system
   * @param ci - Cédula de identidad
   * @returns Promise<number>
   */
  async getMemberPoints(ci: string): Promise<number> {
    try {
      const result = await this.checkMember({ ci });
      return result.points?.available || 0;
    } catch (error) {
      console.error('Error getting member points from San Roque:', error);
      return 0;
    }
  }

  /**
   * Get total member points (available + expiring) from San Roque system
   * @param ci - Cédula de identidad
   * @returns Promise<number>
   */
  async getTotalMemberPoints(ci: string): Promise<number> {
    try {
      const result = await this.checkMember({ ci });
      return result.points?.total || 0;
    } catch (error) {
      console.error('Error getting total member points from San Roque:', error);
      return 0;
    }
  }

  /**
   * Get comprehensive member information from San Roque system
   * @param ci - Cédula de identidad
   * @param documentType - Document type (optional)
   * @returns Promise<SanRoqueResponse>
   */
  async getMemberInfo(ci: string, documentType?: string): Promise<SanRoqueResponse> {
    return this.checkMember({ ci, documentType });
  }
}

// Export a default instance
export default new SanRoqueService();
