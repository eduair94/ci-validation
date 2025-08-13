import axios from "axios";

interface CasmuRequest {
  Cedula: string;
  Medio: string;
  paiIsoNum: string;
  tipoDocumento: string;
}

interface CasmuResponse {
  perid: string;
  retorno: string;
}

export class Casmu {
  private readonly baseUrl = "https://orq.casmu.com/casmucerca-v2/rest";
  private readonly timeout = 10000; // 10 segundos

  /**
   * Extrae el número de cédula sin dígito verificador
   * @param cedula - Número de cédula (con o sin dígito verificador)
   * @returns string - Cédula sin dígito verificador
   */
  private extractCedulaWithoutDigit(cedula: string): string {
    // Si la cédula tiene 7 dígitos, asumimos que ya está sin dígito verificador
    if (cedula.length === 7) {
      return cedula;
    }
    
    // Si tiene 8 dígitos, removemos el último (dígito verificador)
    if (cedula.length === 8) {
      return cedula.substring(0, 7);
    }
    
    // Si es más corta, la devolvemos tal como está
    return cedula;
  }

  /**
   * Verifica si un usuario está registrado en Casmu
   * @param cedula - Número de cédula (con o sin dígito verificador)
   * @returns Promise<boolean> - true si está registrado, false si no
   */
  async isUserRegistered(cedula: string): Promise<boolean> {
    try {
      const cedulaSinDigito = this.extractCedulaWithoutDigit(cedula);
      
      const requestData: CasmuRequest = {
        Cedula: cedulaSinDigito,
        Medio: "broken",
        paiIsoNum: "858",
        tipoDocumento: "1",
      };

      const response = await axios.post<CasmuResponse>(`${this.baseUrl}/P_EnviarCodigoNuevoPIN?fmt=json`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      });

      // Si perid es "0", el usuario no está registrado
      // Si perid tiene un valor numérico mayor a 0, el usuario está registrado
      return response.data.perid !== "0";
    } catch (error) {
      console.error("Error al verificar registro en Casmu:", error);
      // No lanzamos error, devolvemos false para que el servicio principal continue
      return false;
    }
  }

  /**
   * Obtiene la respuesta completa de Casmu para debugging
   * @param cedula - Número de cédula (con o sin dígito verificador)
   * @returns Promise<CasmuResponse> - Respuesta completa del servicio
   */
  async getFullResponse(cedula: string): Promise<CasmuResponse> {
    try {
      const cedulaSinDigito = this.extractCedulaWithoutDigit(cedula);
      
      const requestData: CasmuRequest = {
        Cedula: cedulaSinDigito,
        Medio: "broken",
        paiIsoNum: "858",
        tipoDocumento: "1",
      };

      const response = await axios.post<CasmuResponse>(`${this.baseUrl}/P_EnviarCodigoNuevoPIN?fmt=json`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      console.error("Error al consultar Casmu:", error);
      throw new Error("Error al consultar el servicio de Casmu");
    }
  }

  /**
   * Verifica si el servicio de Casmu está disponible
   * @returns Promise<boolean> - true si el servicio está disponible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      // Realizar una consulta de prueba con timeout reducido
      const testData: CasmuRequest = {
        Cedula: "1234567", // CI de prueba
        Medio: "broken",
        paiIsoNum: "858",
        tipoDocumento: "1",
      };

      await axios.post(
        `${this.baseUrl}/P_EnviarCodigoNuevoPIN?fmt=json`, 
        testData, 
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // Timeout reducido para health check
        }
      );

      return true;
    } catch (error) {
      console.warn("Servicio Casmu no disponible:", error);
      return false;
    }
  }
}
