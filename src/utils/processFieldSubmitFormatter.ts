/**
 * Interfaz para el objeto de request de processFieldSubmit
 */
export interface ProcessFieldSubmitRequest {
  frmId: string;
  attId: string;
  value: string;
}

/**
 * Clase para formatear y generar requests de processFieldSubmit limpios
 */
export class ProcessFieldSubmitFormatter {
  /**
   * Crea un objeto JSON limpio y ordenado para processFieldSubmit
   * @param frmId - ID del formulario
   * @param attId - ID del atributo
   * @param value - Valor del campo
   * @returns Objeto JSON formateado sin elementos duplicados y en orden
   */
  static createRequest(frmId: string, attId: string, value: string): ProcessFieldSubmitRequest {
    // Crear objeto en el orden específico requerido
    const request: ProcessFieldSubmitRequest = {
      frmId: frmId.trim(),
      attId: attId.trim(),
      value: value.trim(),
    };

    return request;
  }

  /**
   * Convierte múltiples requests a un array JSON limpio
   * @param requests - Array de requests con frmId, attId y value
   * @returns Array de objetos JSON formateados, sin duplicados y ordenados
   */
  static createMultipleRequests(requests: Array<{ frmId: string; attId: string; value: string }>): ProcessFieldSubmitRequest[] {
    // Usar un Map para eliminar duplicados basados en frmId + attId
    const uniqueRequests = new Map<string, ProcessFieldSubmitRequest>();

    requests.forEach(({ frmId, attId, value }) => {
      const key = `${frmId.trim()}_${attId.trim()}`;

      // Solo agregar si no existe o si el nuevo valor no está vacío
      if (!uniqueRequests.has(key) || (value.trim() !== "" && uniqueRequests.get(key)?.value === "")) {
        uniqueRequests.set(key, this.createRequest(frmId, attId, value));
      }
    });

    // Convertir a array y ordenar por frmId primero, luego por attId
    return Array.from(uniqueRequests.values()).sort((a, b) => {
      const frmIdComparison = a.frmId.localeCompare(b.frmId);
      if (frmIdComparison !== 0) {
        return frmIdComparison;
      }
      return a.attId.localeCompare(b.attId);
    });
  }

  /**
   * Extrae parámetros de processFieldSubmit de una URL
   * @param url - URL que contiene los parámetros
   * @returns Objeto con los parámetros extraídos o null si no se encuentran
   */
  static extractFromUrl(url: string): ProcessFieldSubmitRequest | null {
    try {
      const urlObj = new URL(url);
      const frmId = urlObj.searchParams.get("frmId");
      const attId = urlObj.searchParams.get("attId");

      if (!frmId || !attId) {
        return null;
      }

      return this.createRequest(frmId, attId, "");
    } catch (error) {
      console.error("Error al extraer parámetros de URL:", error);
      return null;
    }
  }

  /**
   * Convierte el objeto a JSON string formateado
   * @param request - Request object o array de requests
   * @param indent - Número de espacios para indentación (default: 2)
   * @returns JSON string formateado
   */
  static toFormattedJson(request: ProcessFieldSubmitRequest | ProcessFieldSubmitRequest[], indent: number = 2): string {
    return JSON.stringify(request, null, indent);
  }

  /**
   * Valida que un objeto tenga la estructura correcta de ProcessFieldSubmitRequest
   * @param obj - Objeto a validar
   * @returns true si es válido, false si no
   */
  static isValidRequest(obj: any): obj is ProcessFieldSubmitRequest {
    return typeof obj === "object" && obj !== null && typeof obj.frmId === "string" && typeof obj.attId === "string" && typeof obj.value === "string" && Object.keys(obj).length === 3;
  }
}
