export interface CiQueryResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ICiService {
  /**
   * Consulta información de una cédula en el servicio oficial
   * @param ci Número de cédula a consultar
   * @returns Respuesta del servicio con la información
   */
  queryCiInfo(ci: string): Promise<CiQueryResponse>;

  /**
   * Verifica si el servicio externo está disponible
   * @returns true si el servicio está disponible
   */
  isServiceAvailable(): Promise<boolean>;
}
