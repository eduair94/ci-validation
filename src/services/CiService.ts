import axios, { AxiosResponse } from "axios";
import { CiQueryResponse, ICiService } from "../interfaces/ICiService";
import { NewCiService } from "./NewCiService";

export class LoteriaUyCiService implements ICiService {
  private readonly baseUrl = "https://www.mef.gub.uy/bandejatramites/action";
  private readonly timeout = 10000; // 10 segundos

  constructor() {
    // Configurar axios con timeout y headers por defecto
    axios.defaults.timeout = this.timeout;
  }

  async queryCiInfo(ci: string): Promise<CiQueryResponse> {
    const newService = new NewCiService();
    return newService.queryCiInfo(ci);
  }

  async isServiceAvailable(): Promise<boolean> {
    const newService = new NewCiService();
    return newService.isServiceAvailable();
  }

  /**
   * Consulta información de una cédula en el formulario oficial del MEF
   * Deprecated
   */
  async queryCiInfoOld(ci: string): Promise<CiQueryResponse> {
    try {
      const params = new URLSearchParams({
        cmdaction: "obtenercedula",
        numero: ci,
      });

      const response: AxiosResponse<string> = await axios.post(this.baseUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CI-Validation-API/1.0.0",
        },
        timeout: this.timeout,
      });

      if (response.status === 200) {
        return {
          success: true,
          data: response.data as any,
        };
      } else {
        return {
          success: false,
          error: `Respuesta inesperada del servidor: ${response.status}`,
        };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verifica si el servicio externo está disponible
   */
  async isServiceAvailableOld(): Promise<boolean> {
    try {
      // Realizar una consulta de prueba con timeout reducido
      const testParams = new URLSearchParams({
        cmdaction: "obtenercedula",
        numero: "12345678", // CI de prueba
      });

      await axios.post(this.baseUrl, testParams, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000, // Timeout reducido para health check
      });

      return true;
    } catch (error) {
      console.warn("Servicio externo no disponible:", error);
      return false;
    }
  }

  /**
   * Maneja errores de la consulta externa
   */
  private handleError(error: any): CiQueryResponse {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Timeout: El servicio no respondió en el tiempo esperado",
        };
      }

      if (error.response) {
        return {
          success: false,
          error: `Error del servidor: ${error.response.status} - ${error.response.statusText}`,
        };
      }

      if (error.request) {
        return {
          success: false,
          error: "Error de conexión: No se pudo conectar con el servicio",
        };
      }
    }

    return {
      success: false,
      error: `Error inesperado: ${error.message || "Error desconocido"}`,
    };
  }
}
