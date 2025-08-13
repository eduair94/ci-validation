import { CiQueryResponse, ICiService } from "../lib";
import Farmashop from "./Farmashop";
import PuntosMas from "./PuntosMas";
import Tata from "./Tata";

// Interface for user-friendly response
export interface ContactOption {
  type: "email" | "mobile" | "phone" | "other";
  value: string;
  masked?: boolean;
}

export interface FriendlyServiceData {
  service: string;
  status: "available" | "registered" | "not_registered" | "error" | "needs_action";
  points?: number;
  balance?: number;
  message?: string;
  contactOptions?: ContactOption[];
  actionRequired?: string;
}

export interface FriendlyCiResponse {
  success: boolean;
  cedula: string;
  data: {
    persona: {
      summary: {
        totalServices: number;
        availableServices: number;
        totalPoints: number;
        hasRegistrations: boolean;
      };
      services: FriendlyServiceData[];
    };
  };
  error?: string;
  errors?: string[];
}

export class ExternalCiService implements ICiService {
  async check(document: string, options?: { ignoreCache?: boolean; forceRefresh?: boolean }, att = 0) {
    return this.queryCiInfo(document);
  }

  async queryCiInfo(ci: string): Promise<CiQueryResponse> {
    const requests = [new PuntosMas(ci).getPoints(), new Farmashop(ci).getPoints(), new Tata(ci).getPoints()];
    const responses = await Promise.allSettled(requests);
    return {
      success: true,
      data: {
        persona: {
          cedula: ci,
          puntosMas: responses[0].status === "fulfilled" ? responses[0].value : null,
          farmashop: responses[1].status === "fulfilled" ? responses[1].value : null,
          tata: responses[2].status === "fulfilled" ? responses[2].value : null,
        },
      },
    };
  }
  /**
   * Transforms the raw queryCiInfo response into a user-friendly format
   * @param ci - The CI number
   * @returns Promise with user-friendly formatted data
   */
  async getUserFriendlyInfo(ci: string): Promise<FriendlyCiResponse> {
    try {
      const rawResponse = await this.queryCiInfo(ci);

      if (!rawResponse.success || !rawResponse.data) {
        return {
          success: false,
          cedula: ci,
          data: {
            persona: {
              summary: {
                totalServices: 0,
                availableServices: 0,
                totalPoints: 0,
                hasRegistrations: false,
              },
              services: [],
            },
          },
          error: [rawResponse.error || "Failed to fetch data"].join(", "),
          errors: [rawResponse.error || "Failed to fetch data"],
        };
      }

      const persona = rawResponse.data.persona;
      const services: FriendlyServiceData[] = [];
      const errors: string[] = [];
      let totalPoints = 0;
      let availableServices = 0;

      // Process PuntosMas
      if (persona.puntosMas) {
        if (persona.puntosMas.error) {
          services.push({
            service: "PuntosMas",
            status: "error",
            message: persona.puntosMas.error,
          });
          errors.push(`PuntosMas: ${persona.puntosMas.error}`);
        } else if (persona.puntosMas.Total !== undefined) {
          const points = persona.puntosMas.Total || 0;
          totalPoints += points;
          availableServices++;

          services.push({
            service: "PuntosMas",
            status: points > 0 ? "available" : "registered",
            points: points,
            message: points > 0 ? `Tienes ${points} puntos disponibles` : "Registrado sin puntos",
          });
        }
      }

      // Process Farmashop
      if (persona.farmashop) {
        if (persona.farmashop.statusCode === 200 && persona.farmashop.responseContent) {
          const content = persona.farmashop.responseContent;

          if (content.valid) {
            availableServices++;
            const contactOptions: ContactOption[] =
              content.options?.map((opt: any) => ({
                type: opt.type === "email" ? "email" : "mobile",
                value: opt.value,
                masked: opt.value.includes("*"),
              })) || [];

            services.push({
              service: "Farmashop",
              status: "registered",
              message: "Cuenta activa y verificada",
              contactOptions: contactOptions,
            });
          } else {
            services.push({
              service: "Farmashop",
              status: "needs_action",
              message: content.message?.replace(/<[^>]*>/g, "") || "Requiere acción",
              actionRequired: "Completar registro o verificar email",
            });
          }
        } else {
          services.push({
            service: "Farmashop",
            status: "error",
            message: "Error de conexión con el servicio",
          });
          errors.push("Farmashop: Error de conexión");
        }
      }

      // Process Tata
      if (persona.tata) {
        if (Array.isArray(persona.tata)) {
          // Active member with contact data
          availableServices++;
          const contactOptions: ContactOption[] = persona.tata.map((contact: any) => ({
            type: contact.type === "EMAIL" ? "email" : "other",
            value: contact.contactData,
            masked: contact.contactData.includes("*"),
          }));

          services.push({
            service: "Tata",
            status: "registered",
            message: "Miembro activo del programa",
            contactOptions: contactOptions,
          });
        } else if (persona.tata.internalCode) {
          switch (persona.tata.internalCode) {
            case "MEMBER_NOT_EXISTS":
              services.push({
                service: "Tata",
                status: "not_registered",
                message: "No estás registrado en el programa",
              });
              break;
            case "PENDING_OLD_MEMBER":
              services.push({
                service: "Tata",
                status: "needs_action",
                message: "Miembro del programa anterior, requiere migración",
                actionRequired: "Contactar para migrar cuenta",
              });
              break;
            default:
              services.push({
                service: "Tata",
                status: "error",
                message: persona.tata.message || "Estado desconocido",
              });
              errors.push(`Tata: ${persona.tata.message}`);
          }
        }
      }

      return {
        success: true,
        cedula: ci,
        data: {
          persona: {
            summary: {
              totalServices: services.length,
              availableServices: availableServices,
              totalPoints: totalPoints,
              hasRegistrations: services.some((s) => ["registered", "available"].includes(s.status)),
            },
            services: services,
          },
        },
        error: errors.length > 0 ? errors.join(", ") : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        cedula: ci,
        data: {
          persona: {
            summary: {
              totalServices: 0,
              availableServices: 0,
              totalPoints: 0,
              hasRegistrations: false,
            },
            services: [],
          },
        },
        error: [error instanceof Error ? error.message : "Unknown error occurred"].join(", "),
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      };
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    return true;
  }
}
