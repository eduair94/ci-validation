import { CiQueryResponse, ICiService } from "../lib";
import Farmashop from "./Farmashop";
import PuntosMas from "./PuntosMas";
import Tata from "./Tata";

export class ExternalCiService implements ICiService {
  async check(document: string, options?: { ignoreCache?: boolean; forceRefresh?: boolean }, att = 0) {
    return this.queryCiInfo(document);
  }

  async queryCiInfo(ci: string): Promise<CiQueryResponse> {
    return {
      success: true,
      data: {
        persona: {
          cedula: ci,
          puntosMas: await new PuntosMas(ci).getPoints(),
          farmashop: await new Farmashop(ci).getPoints(),
          tata: await new Tata(ci).getPoints(),
        },
      },
    };
  }
  async isServiceAvailable(): Promise<boolean> {
    return true;
  }
}
