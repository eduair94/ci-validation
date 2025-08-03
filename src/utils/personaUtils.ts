// Implementación temporal hasta que se instale gender-detection-from-name
// import { getGender } from 'gender-detection-from-name';

/**
 * Base de datos básica de nombres en español
 */
const NOMBRES_MASCULINOS = ["JUAN", "CARLOS", "JOSE", "ANTONIO", "FRANCISCO", "MANUEL", "DAVID", "DANIEL", "MIGUEL", "RAFAEL", "PEDRO", "ANGEL", "ALEJANDRO", "FERNANDO", "RICARDO", "ROBERTO", "EDUARDO", "LUIS", "JAVIER", "JORGE", "ALBERTO", "DIEGO", "MARIO", "SERGIO", "PABLO", "RAUL", "GUILLERMO", "IVAN", "OSCAR", "VICTOR", "ARTURO", "RODRIGO", "LEONARDO", "EMILIO", "GABRIEL", "MARTIN", "ANDRES", "ADRIAN", "ENRIQUE", "RUBEN", "RAMON", "NICOLAS", "CRISTIAN", "MAXIMILIANO", "SANTIAGO"];

const NOMBRES_FEMENINOS = [
  "MARIA",
  "ANA",
  "CARMEN",
  "JOSEFA",
  "ISABEL",
  "ANTONIO",
  "DOLORES",
  "PILAR",
  "TERESA",
  "ANGELES",
  "MERCEDES",
  "ROSA",
  "FRANCISCA",
  "CRISTINA",
  "ANTONIA",
  "ELENA",
  "CONCEPCION",
  "MANUELA",
  "SOLEDAD",
  "AMPARO",
  "SUSANA",
  "JULIA",
  "MARGARITA",
  "ESPERANZA",
  "PIEDAD",
  "NURIA",
  "SILVIA",
  "MONICA",
  "PATRICIA",
  "BEATRIZ",
  "VIRGINIA",
  "ROCIO",
  "INMACULADA",
  "RAQUEL",
  "MONTSERRAT",
  "VICTORIA",
  "ANDREA",
  "SOFIA",
  "LUCIA",
  "VALENTINA",
  "CAMILA",
  "ISABELLA",
  "NATALIA",
  "PAOLA",
  "GABRIELA",
  "ALEJANDRA",
  "CAROLINA",
  "FERNANDA",
  "LAURA",
];

/**
 * Función temporal para detectar género hasta que se instale la librería
 */
function getGenderTemp(nombre: string, idioma?: string): "male" | "female" | "unknown" {
  const nombreUpper = nombre.toUpperCase().trim();

  if (NOMBRES_MASCULINOS.includes(nombreUpper)) {
    return "male";
  }

  if (NOMBRES_FEMENINOS.includes(nombreUpper)) {
    return "female";
  }

  // Heurísticas básicas para nombres en español
  if (nombreUpper.endsWith("A") && !nombreUpper.endsWith("IA")) {
    // Muchos nombres femeninos terminan en A
    return "female";
  }

  if (nombreUpper.endsWith("O")) {
    // Muchos nombres masculinos terminan en O
    return "male";
  }

  return "unknown";
}

/**
 * Interfaz para información de género
 */
export interface GenderInfo {
  genero: "masculino" | "femenino" | "desconocido";
  confianza: "alta" | "media" | "baja";
  primerNombre: string;
  segundoNombre?: string;
}

/**
 * Interfaz para información adicional de la persona
 */
export interface PersonaInfoAdicional {
  genero: GenderInfo;
  iniciales: string;
  nombreCompleto: string;
  longitudNombre: number;
  tieneSegundoNombre: boolean;
  cantidadNombres: number;
  generacion?: "Gen Z" | "Millennial" | "Gen X" | "Baby Boomer" | "Silent Generation";
}

/**
 * Utilidades para análisis de información personal
 */
export class PersonaUtils {
  /**
   * Determina el género basado en el primer nombre
   * @param nombres - Nombres completos de la persona
   * @returns Información del género
   */
  static determinarGenero(nombres: string): GenderInfo {
    if (!nombres || typeof nombres !== "string") {
      return {
        genero: "desconocido",
        confianza: "baja",
        primerNombre: "",
      };
    }

    const nombresArray = nombres.trim().split(/\s+/);
    const primerNombre = nombresArray[0];
    const segundoNombre = nombresArray[1];

    try {
      // Intentar detectar género en español primero
      const generoES = getGenderTemp(primerNombre, "es");

      // Si no se encuentra en español, intentar en inglés como respaldo
      const generoEN = generoES === "unknown" ? getGenderTemp(primerNombre, "en") : generoES;

      // Mapear resultado a español
      let genero: "masculino" | "femenino" | "desconocido" = "desconocido";
      let confianza: "alta" | "media" | "baja" = "baja";

      if (generoES !== "unknown") {
        // Género encontrado en español - alta confianza
        genero = generoES === "male" ? "masculino" : "femenino";
        confianza = "alta";
      } else if (generoEN !== "unknown") {
        // Género encontrado solo en inglés - media confianza
        genero = generoEN === "male" ? "masculino" : "femenino";
        confianza = "media";
      }

      return {
        genero,
        confianza,
        primerNombre,
        segundoNombre,
      };
    } catch (error) {
      console.warn("Error determinando género:", error);
      return {
        genero: "desconocido",
        confianza: "baja",
        primerNombre,
        segundoNombre,
      };
    }
  }

  /**
   * Genera las iniciales de una persona
   * @param nombres - Nombres de la persona
   * @param apellidos - Apellidos de la persona
   * @returns Iniciales en formato "N.A."
   */
  static generarIniciales(nombres: string, apellidos: string): string {
    const inicialesNombres = nombres
      ? nombres
          .split(/\s+/)
          .map((n) => n.charAt(0).toUpperCase())
          .join(".")
      : "";

    const inicialesApellidos = apellidos
      ? apellidos
          .split(/\s+/)
          .map((a) => a.charAt(0).toUpperCase())
          .join(".")
      : "";

    if (inicialesNombres && inicialesApellidos) {
      return `${inicialesNombres}.${inicialesApellidos}.`;
    } else if (inicialesNombres) {
      return `${inicialesNombres}.`;
    } else if (inicialesApellidos) {
      return `${inicialesApellidos}.`;
    }

    return "";
  }

  /**
   * Determina la generación aproximada basada en la edad
   * @param edad - Edad de la persona
   * @returns Generación estimada
   */
  static determinarGeneracion(edad: number): string | undefined {
    if (edad < 0 || edad > 120) return undefined;

    const añoActual = new Date().getFullYear();
    const añoNacimiento = añoActual - edad;

    if (añoNacimiento >= 1997) return "Gen Z";
    if (añoNacimiento >= 1981) return "Millennial";
    if (añoNacimiento >= 1965) return "Gen X";
    if (añoNacimiento >= 1946) return "Baby Boomer";
    if (añoNacimiento >= 1928) return "Silent Generation";

    return undefined;
  }

  /**
   * Analiza información adicional de la persona
   * @param nombres - Nombres de la persona
   * @param apellidos - Apellidos de la persona
   * @param edad - Edad de la persona (opcional)
   * @returns Información adicional procesada
   */
  static analizarPersona(nombres: string, apellidos: string, edad?: number): PersonaInfoAdicional {
    const genero = this.determinarGenero(nombres);
    const iniciales = this.generarIniciales(nombres, apellidos);
    const nombreCompleto = `${nombres || ""} ${apellidos || ""}`.trim();

    const nombresArray = nombres ? nombres.trim().split(/\s+/) : [];
    const cantidadNombres = nombresArray.length;
    const tieneSegundoNombre = cantidadNombres > 1;
    const longitudNombre = nombreCompleto.length;

    const generacion = edad !== undefined ? this.determinarGeneracion(edad) : undefined;

    return {
      genero,
      iniciales,
      nombreCompleto,
      longitudNombre,
      tieneSegundoNombre,
      cantidadNombres,
      generacion: generacion as any,
    };
  }

  /**
   * Normaliza el formato de nombres (primera letra mayúscula)
   * @param nombres - Nombres a normalizar
   * @returns Nombres normalizados
   */
  static normalizarNombres(nombres: string): string {
    if (!nombres || typeof nombres !== "string") return "";

    return nombres
      .toLowerCase()
      .split(/\s+/)
      .map((nombre) => nombre.charAt(0).toUpperCase() + nombre.slice(1))
      .join(" ");
  }

  /**
   * Valida si un nombre contiene solo caracteres válidos
   * @param nombre - Nombre a validar
   * @returns true si el nombre es válido
   */
  static validarNombre(nombre: string): boolean {
    if (!nombre || typeof nombre !== "string") return false;

    // Permitir letras, espacios, acentos, apostrofes y guiones
    const regex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'\-]+$/;
    return regex.test(nombre.trim()) && nombre.trim().length > 0;
  }

  /**
   * Extrae información de formato de nombre común en Uruguay
   * @param nombreCompleto - Nombre completo en formato "Apellido, Nombre"
   * @returns Objeto con nombres y apellidos separados
   */
  static parsearNombreUruguayo(nombreCompleto: string): { nombres: string; apellidos: string } {
    if (!nombreCompleto || typeof nombreCompleto !== "string") {
      return { nombres: "", apellidos: "" };
    }

    // Si contiene coma, asumir formato "Apellido, Nombre"
    if (nombreCompleto.includes(",")) {
      const [apellidos, nombres] = nombreCompleto.split(",").map((s) => s.trim());
      return {
        nombres: nombres || "",
        apellidos: apellidos || "",
      };
    }

    // Si no contiene coma, asumir que ya está en formato correcto
    return { nombres: nombreCompleto, apellidos: "" };
  }
}
