// Main library export
export { LoteriaUyCiService } from "../services/CiService";
export { DependencyContainer } from "../utils/dependencyContainer";
export { UruguayanCiValidator } from "../validators/CiValidator";

// Export interfaces
export type { ApiResponse, CiValidationData, CiValidationRequest, ErrorResponse, HealthCheckResponse } from "../interfaces/ApiResponse";
export type { CiQueryResponse, ICiService } from "../interfaces/ICiService";
export type { ICiValidator } from "../interfaces/ICiValidator";

// Main validation function for easy usage
import { LoteriaUyCiService } from "../services/CiService";
import { UruguayanCiValidator } from "../validators/CiValidator";

const validator = new UruguayanCiValidator();
const service = new LoteriaUyCiService();

/**
 * Validates a Uruguayan CI (Cédula de Identidad)
 * @param ci - The CI number to validate (7-8 digits)
 * @returns true if the CI is valid according to the official algorithm
 *
 * @example
 * ```typescript
 * import { validateCI } from 'ci-validation';
 *
 * const isValid = validateCI('19119365');
 * console.log(isValid); // true or false
 * ```
 */
export function validateCI(ci: string): boolean {
  return validator.validate(ci);
}

/**
 * Normalizes a CI by adding leading zeros and removing non-numeric characters
 * @param ci - The CI number to normalize
 * @returns The normalized CI (8 digits)
 *
 * @example
 * ```typescript
 * import { normalizeCI } from 'ci-validation';
 *
 * const normalized = normalizeCI('1234567');
 * console.log(normalized); // '01234567'
 * ```
 */
export function normalizeCI(ci: string): string {
  return validator.normalize(ci);
}

/**
 * Validates the format of a CI (length and numeric characters)
 * @param ci - The CI number to validate format
 * @returns true if the format is valid
 *
 * @example
 * ```typescript
 * import { validateCIFormat } from 'ci-validation';
 *
 * const hasValidFormat = validateCIFormat('1234567');
 * console.log(hasValidFormat); // true
 * ```
 */
export function validateCIFormat(ci: string): boolean {
  return validator.validateFormat(ci);
}

/**
 * Queries information about a CI from the official Uruguayan service
 * @param ci - The CI number to query
 * @returns Promise with the query result
 *
 * @example
 * ```typescript
 * import { queryCIInfo } from 'ci-validation';
 *
 * const result = await queryCIInfo('19119365');
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function queryCIInfo(ci: string) {
  return await service.queryCiInfo(ci);
}

/**
 * Complete CI validation with information query
 * @param ci - The CI number to validate and query
 * @returns Promise with validation result and information if available
 *
 * @example
 * ```typescript
 * import { validateAndQuery } from 'ci-validation';
 *
 * const result = await validateAndQuery('19119365');
 * console.log(result);
 * ```
 */
export async function validateAndQuery(ci: string) {
  const isValid = validator.validate(ci);

  if (!isValid) {
    return {
      success: false,
      error: "Invalid CI: check digit verification failed",
      code: "INVALID_CI",
    };
  }

  const normalizedCi = validator.normalize(ci);
  const queryResult = await service.queryCiInfo(normalizedCi);

  return {
    success: true,
    data: {
      ci: ci,
      isValid: true,
      normalizedCi: normalizedCi,
      info: queryResult.success ? queryResult.data : queryResult.error,
    },
  };
}

// Version info
export const VERSION = "1.0.0";

// Default export
export default {
  validateCI,
  normalizeCI,
  validateCIFormat,
  queryCIInfo,
  validateAndQuery,
  VERSION,
};
