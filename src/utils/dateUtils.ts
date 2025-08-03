/**
 * Utilidades para el manejo de fechas de nacimiento
 */
export class DateUtils {
  /**
   * Convierte string de fecha de nacimiento a objeto Date
   * @param fechaString - Fecha en formato string (ej: "DD/MM/YYYY", "YYYY-MM-DD", etc.)
   * @returns Date object o null si no se puede parsear
   */
  static parseFechaNacimiento(fechaString: string): Date | null {
    if (!fechaString || typeof fechaString !== "string") {
      return null;
    }

    try {
      // Limpiar la fecha de espacios y caracteres extraños
      const fechaLimpia = fechaString.trim();

      // Intentar diferentes formatos comunes
      const formatosComunes = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY o D/M/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
      ];

      // Formato DD/MM/YYYY
      const matchDDMMYYYY = fechaLimpia.match(formatosComunes[0]);
      if (matchDDMMYYYY) {
        const [, dia, mes, año] = matchDDMMYYYY;
        const diaNum = parseInt(dia);
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        // Validar rangos antes de crear la fecha
        if (!this.validarRangosFecha(diaNum, mesNum, añoNum)) {
          return null;
        }

        const fecha = new Date(añoNum, mesNum - 1, diaNum);
        return this.validarFecha(fecha, diaNum, mesNum, añoNum) ? fecha : null;
      }

      // Formato YYYY-MM-DD
      const matchYYYYMMDD = fechaLimpia.match(formatosComunes[1]);
      if (matchYYYYMMDD) {
        const [, año, mes, dia] = matchYYYYMMDD;
        const diaNum = parseInt(dia);
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        // Validar rangos antes de crear la fecha
        if (!this.validarRangosFecha(diaNum, mesNum, añoNum)) {
          return null;
        }

        const fecha = new Date(añoNum, mesNum - 1, diaNum);
        return this.validarFecha(fecha, diaNum, mesNum, añoNum) ? fecha : null;
      }

      // Formato DD-MM-YYYY
      const matchDDMMYYYYGuion = fechaLimpia.match(formatosComunes[2]);
      if (matchDDMMYYYYGuion) {
        const [, dia, mes, año] = matchDDMMYYYYGuion;
        const diaNum = parseInt(dia);
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        // Validar rangos antes de crear la fecha
        if (!this.validarRangosFecha(diaNum, mesNum, añoNum)) {
          return null;
        }

        const fecha = new Date(añoNum, mesNum - 1, diaNum);
        return this.validarFecha(fecha, diaNum, mesNum, añoNum) ? fecha : null;
      }

      // Intentar parseo directo como último recurso
      const fechaDirecta = new Date(fechaLimpia);
      return this.validarFecha(fechaDirecta) ? fechaDirecta : null;
    } catch (error) {
      console.warn("Error parseando fecha de nacimiento:", error);
      return null;
    }
  }

  /**
   * Valida rangos básicos de día, mes y año antes de crear la fecha
   * @param dia - Día del mes (1-31)
   * @param mes - Mes (1-12)
   * @param año - Año (1900-actual)
   * @returns true si los rangos son válidos
   */
  static validarRangosFecha(dia: number, mes: number, año: number): boolean {
    // Validar rangos básicos
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;

    const añoActual = new Date().getFullYear();
    if (año < 1900 || año > añoActual) return false;

    return true;
  }

  /**
   * Valida que una fecha sea válida y razonable para fecha de nacimiento
   * Verifica que la fecha creada corresponda exactamente a los valores originales
   * @param fecha - Fecha a validar
   * @param diaOriginal - Día original ingresado (opcional)
   * @param mesOriginal - Mes original ingresado (opcional)
   * @param añoOriginal - Año original ingresado (opcional)
   * @returns true si la fecha es válida
   */
  static validarFecha(fecha: Date, diaOriginal?: number, mesOriginal?: number, añoOriginal?: number): boolean {
    // Verificar que es una fecha válida
    if (isNaN(fecha.getTime())) {
      return false;
    }

    // Si se proporcionan valores originales, verificar que la fecha creada sea exactamente igual
    if (diaOriginal !== undefined && mesOriginal !== undefined && añoOriginal !== undefined) {
      if (fecha.getDate() !== diaOriginal || fecha.getMonth() !== mesOriginal - 1 || fecha.getFullYear() !== añoOriginal) {
        return false; // La fecha fue normalizada por JavaScript, lo que indica valores inválidos
      }
    }

    const año = fecha.getFullYear();
    const añoActual = new Date().getFullYear();

    // Validar rango razonable (entre 1900 y año actual)
    if (año < 1900 || año > añoActual) {
      return false;
    }

    // Verificar que no sea fecha futura
    if (fecha > new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Calcula la edad en años basada en la fecha de nacimiento
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns Edad en años
   */
  static calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    // Ajustar si el cumpleaños aún no ha ocurrido este año
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    const mesNacimiento = fechaNacimiento.getMonth();
    const diaNacimiento = fechaNacimiento.getDate();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
      edad--;
    }

    return edad;
  }

  /**
   * Procesa una fecha de nacimiento string y retorna la fecha Date y la edad
   * @param fechaString - Fecha en formato string
   * @returns Objeto con fecha Date y edad, o null si no se puede procesar
   */
  static procesarFechaNacimiento(fechaString: string): { fechaDate: Date; edad: number } | null {
    if (!fechaString) {
      return null;
    }

    try {
      const fechaDate = this.parseFechaNacimiento(fechaString);

      if (!fechaDate) {
        return null;
      }

      const edad = this.calcularEdad(fechaDate);

      return {
        fechaDate,
        edad,
      };
    } catch (error) {
      console.warn("Error procesando fecha de nacimiento:", error);
      return null;
    }
  }
}
