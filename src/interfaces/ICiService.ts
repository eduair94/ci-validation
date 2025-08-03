export interface CiQueryResponse {
  success: boolean;
  data?: {
    persona: {
      nombre: string;
      apellido: string;
      fechaNacimiento?: string;
      fechaNacimientoDate?: Date | null;
      edad?: number | null;
      cedula?: string;
      // Nuevos campos de información adicional
      genero?: {
        genero: 'masculino' | 'femenino' | 'desconocido';
        confianza: 'alta' | 'media' | 'baja';
        primerNombre: string;
        segundoNombre?: string;
      };
      iniciales?: string;
      nombreCompleto?: string;
      longitudNombre?: number;
      tieneSegundoNombre?: boolean;
      cantidadNombres?: number;
      generacion?: 'Gen Z' | 'Millennial' | 'Gen X' | 'Baby Boomer' | 'Silent Generation';
      [key: string]: any;
    };
    message: string;
    status: number;
  };
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
