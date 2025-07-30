export interface ICiValidator {
  /**
   * Valida una cédula de identidad uruguaya
   * @param ci Número de cédula a validar
   * @returns true si la cédula es válida, false en caso contrario
   */
  validate(ci: string): boolean;

  /**
   * Normaliza una cédula agregando ceros a la izquierda si es necesario
   * @param ci Número de cédula a normalizar
   * @returns Cédula normalizada a 8 dígitos
   */
  normalize(ci: string): string;

  /**
   * Valida el formato de una cédula (solo números, longitud correcta)
   * @param ci Número de cédula a validar
   * @returns true si el formato es válido
   */
  validateFormat(ci: string): boolean;

  /**
   * Calcula el dígito verificador de una cédula
   * @param ci Número de cédula sin el dígito verificador
   * @returns Dígito verificador calculado
   */
  calculateCheckDigit(ciWithoutCheckDigit: string): number;
}
