import axios from "axios";

interface ANVData {
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre: string;
  segundo_apellido: string;
  fecha_nacimiento: string;
}

interface ANVResponse {
  success?: boolean;
  data?: ANVData;
  error?: string;
  message?: string;
  [key: string]: any;
}

export class ANV {
  private readonly baseUrl = "https://gestion.anv.gub.uy/serviciosDMZ/api/app";
  private readonly timeout = 10000; // 10 segundos
  private readonly bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiQU5WIiwiZG9jdW1lbnRvIjoiMCIsInRpcG9fZG9jdW1lbnRvIjoiMCIsImlzX3N1cGVydmlzb3IiOiIwIiwib3BlcmF0b3JfY29kZSI6IjAiLCJzdWN1cnNhbCI6IiIsInBlcm1pc29zIjoiIiwiaGFzaCI6IiIsInR4IjoiIiwiZGF0b3MiOiIiLCJyb2xlcyI6IiIsIm5iZiI6MTcyNDg3OTU0MSwiZXhwIjoyMDQwNDEyMzQxLCJpYXQiOjE3MjQ4Nzk1NDF9.qp35Z1X5wKqBH_iB5Nt24BO1fQvnWf07dUO1ul4WFzA";

  /**
   * Busca información de una persona en ANV por cédula
   * @param cedula - Número de cédula a consultar
   * @returns Promise<ANVResponse> - Información de la persona encontrada
   */
  async buscarPersona(cedula: string): Promise<ANVResponse> {
    try {
      const response = await axios.get<ANVResponse>(`${this.baseUrl}/BuscarPersonaDNIC?cedula=${cedula}`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data as any,
        ...response.data,
      };
    } catch (error) {
      console.error("Error al consultar ANV:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          return {
            success: false,
            error: `Error del servidor ANV: ${error.response.status} - ${error.response.statusText}`,
            data: error.response.data,
          };
        }

        if (error.code === "ECONNABORTED") {
          return {
            success: false,
            error: "Timeout: El servicio ANV no respondió en el tiempo esperado",
          };
        }

        return {
          success: false,
          error: "Error de conexión con el servicio ANV",
        };
      }

      return {
        success: false,
        error: "Error inesperado al consultar ANV",
      };
    }
  }

  /**
   * Verifica si una persona está registrada en ANV
   * @param cedula - Número de cédula a verificar
   * @returns Promise<boolean> - true si está registrada, false si no
   */
  async isPersonRegistered(cedula: string): Promise<boolean> {
    try {
      const response = await this.buscarPersona(cedula);

      // Si la consulta fue exitosa y hay datos, consideramos que está registrada
      if (response.success && response.data) {
        // Verificamos si hay información válida en la respuesta
        return response.data !== null && response.data !== undefined && Object.keys(response.data).length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error al verificar registro en ANV:", error);
      return false;
    }
  }

  /**
   * Verifica si el servicio ANV está disponible
   * @returns Promise<boolean> - true si el servicio está disponible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      // Realizar una consulta de prueba con timeout reducido
      await axios.get(
        `${this.baseUrl}/BuscarPersonaDNIC?cedula=12345678`, // CI de prueba
        {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // Timeout reducido para health check
        }
      );

      return true;
    } catch (error) {
      // Si es un error 404 o similar, el servicio está disponible pero no hay datos
      if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
        return true;
      }

      console.warn("Servicio ANV no disponible:", error);
      return false;
    }
  }

  /**
   * Obtiene información detallada de una persona desde ANV
   * @param cedula - Número de cédula a consultar
   * @returns Promise<any> - Información completa de la persona
   */
  async getPersonInfo(cedula: string): Promise<any> {
    const response = await this.buscarPersona(cedula);
    return response.data;
  }
}
