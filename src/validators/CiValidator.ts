import { ICiValidator } from '../interfaces/ICiValidator';

export class UruguayanCiValidator implements ICiValidator {
  private readonly CI_LENGTH = 8;
  private readonly MIN_CI_LENGTH = 7;
  private readonly MULTIPLIERS = [2, 9, 8, 7, 6, 3, 4];

  /**
   * Valida una cédula de identidad uruguaya completa
   */
  validate(ci: string): boolean {
    if (!this.validateFormat(ci)) {
      return false;
    }

    const normalizedCi = this.normalize(ci);
    const ciWithoutCheckDigit = normalizedCi.slice(0, 7);
    const providedCheckDigit = parseInt(normalizedCi.slice(7), 10);
    const calculatedCheckDigit = this.calculateCheckDigit(ciWithoutCheckDigit);

    return providedCheckDigit === calculatedCheckDigit;
  }

  /**
   * Normaliza la cédula agregando ceros a la izquierda
   */
  normalize(ci: string): string {
    const cleanCi = this.sanitize(ci);
    return cleanCi.padStart(this.CI_LENGTH, '0');
  }

  /**
   * Valida el formato básico de la cédula
   */
  validateFormat(ci: string): boolean {
    if (!ci || typeof ci !== 'string') {
      return false;
    }

    const cleanCi = this.sanitize(ci);
    
    // Verificar que solo contenga números después de limpiar
    if (!/^\d+$/.test(cleanCi)) {
      return false;
    }

    // Verificar que el input original no contenga caracteres alfabéticos
    if (/[a-zA-Z]/.test(ci)) {
      return false;
    }

    // Verificar longitud
    return cleanCi.length >= this.MIN_CI_LENGTH && cleanCi.length <= this.CI_LENGTH;
  }

  /**
   * Calcula el dígito verificador según el algoritmo uruguayo
   */
  calculateCheckDigit(ciWithoutCheckDigit: string): number {
    if (ciWithoutCheckDigit.length !== 7) {
      throw new Error('CI debe tener exactamente 7 dígitos para calcular el verificador');
    }

    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(ciWithoutCheckDigit[i], 10);
      sum += digit * this.MULTIPLIERS[i];
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Limpia la cédula de caracteres no numéricos
   */
  private sanitize(ci: string): string {
    return ci.replace(/\D/g, '');
  }
}
