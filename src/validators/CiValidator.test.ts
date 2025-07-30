import { UruguayanCiValidator } from '../validators/CiValidator';

describe('UruguayanCiValidator', () => {
  let validator: UruguayanCiValidator;

  beforeEach(() => {
    validator = new UruguayanCiValidator();
  });

  describe('validateFormat', () => {
    it('should accept valid 8-digit CI', () => {
      expect(validator.validateFormat('47073450')).toBe(true);
    });

    it('should accept valid 7-digit CI', () => {
      expect(validator.validateFormat('1234567')).toBe(true);
    });

    it('should reject CI with letters', () => {
      expect(validator.validateFormat('1234567a')).toBe(false);
    });

    it('should reject empty CI', () => {
      expect(validator.validateFormat('')).toBe(false);
    });

    it('should reject CI that is too short', () => {
      expect(validator.validateFormat('123456')).toBe(false);
    });

    it('should reject CI that is too long', () => {
      expect(validator.validateFormat('123456789')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should pad 7-digit CI with leading zero', () => {
      expect(validator.normalize('1234567')).toBe('01234567');
    });

    it('should not change 8-digit CI', () => {
      expect(validator.normalize('47073450')).toBe('47073450');
    });

    it('should remove non-numeric characters', () => {
      expect(validator.normalize('4.707.345-0')).toBe('47073450');
    });
  });

  describe('calculateCheckDigit', () => {
    it('should calculate correct check digit for known CI', () => {
      // Para la CI 4707345, el dígito verificador debe ser 0
      expect(validator.calculateCheckDigit('4707345')).toBe(0);
    });

    it('should throw error for invalid length', () => {
      expect(() => {
        validator.calculateCheckDigit('123456');
      }).toThrow('CI debe tener exactamente 7 dígitos para calcular el verificador');
    });
  });

  describe('validate', () => {
    it('should validate known valid CI', () => {
      // CI de ejemplo que sabemos que es válida
      expect(validator.validate('47073450')).toBe(true);
    });

    it('should reject CI with wrong check digit', () => {
      expect(validator.validate('47073451')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(validator.validate('invalid')).toBe(false);
    });
  });
});
