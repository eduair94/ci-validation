import axios, { AxiosResponse } from "axios";
import { load } from "cheerio";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import https from "https";
import path from "path";
import { createWorker, OEM, PSM } from "tesseract.js";
import { CiQueryResponse, ICiService } from "../interfaces/ICiService";
import { SessionData, TaskData } from "../interfaces/ISessionStorage";
import { ISessionStorage, SessionStorageFactory } from "../storage";
import { DateUtils } from "../utils/dateUtils";
import { PersonaUtils } from "../utils/personaUtils";
import { ANV } from "./ANV";
dotenv.config();

// Type definitions for iframe parsing
interface IframeInfo {
  src: string;
  id?: string;
  name?: string;
  width?: string;
  height?: string;
  index: number;
}

interface NewCiResponse {
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  hasSession?: boolean;
}

export interface UrsecResponse {
  captchaSolveAttempts: number;
  response: string;
  isInRecord: boolean;
  error?: string;
}

interface ParsedContent {
  title: string;
  metaDescription?: string;
  iframes: IframeInfo[];
  scripts: string[];
  iframeCount: number;
  scriptCount: number;
}

interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
}

export class NewCiService implements ICiService {
  private readonly targetUrl = "https://www.tramitesenlinea.mef.gub.uy/Apia/portal/tramite.jsp?id=2629";
  private readonly serviceUrl = "https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run";
  private static readonly outputDir = process.env.VERCEL ? "/tmp/responses" : path.join(__dirname, "..", "responses");
  private cookies: string = "";
  sessionId = "unique-session-1";
  private email = "dev@cybersecurity.com";
  private static sessionStorage: ISessionStorage | null = null;
  httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Only ignore certs in development
    keepAlive: true,
    timeout: 10000,
    maxSockets: 10,
    maxFreeSockets: 10,
  });
  timestamp = Date.now();

  introHeaders = {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "es-ES,es;q=0.9",
    connection: "keep-alive",
    host: "www.tramitesenlinea.mef.gub.uy",
    "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  };

  attId = "8461";
  frmId = "6767";

  /**
   * Initialize session storage based on environment
   */
  public static async initializeSessionStorage(): Promise<void> {
    if (NewCiService.sessionStorage) return;
    try {
      NewCiService.sessionStorage = await SessionStorageFactory.createStorage({
        expirationTime: 24 * 60 * 60 * 1000 * 10000, // Too much time.
        autoCleanup: false,
      });
      console.log("✅ Session storage initialized");
    } catch (error) {
      console.error("❌ Failed to initialize session storage:", error);
    }
    NewCiService.ensureOutputDirectory();
  }

  /**
   * Ensures the output directory exists
   */
  private static async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(NewCiService.outputDir, { recursive: true });
    } catch (error) {
      console.error("Error creating output directory:", error);
    }
  }

  /**
   * Save session using the new storage system
   */
  private async saveSession(tabId: string, tokenId: string, cookies: string, taskData: TaskData): Promise<void> {
    if (!NewCiService.sessionStorage) return;
    const sessionId = this.sessionId;
    try {
      await NewCiService.sessionStorage.saveSession(sessionId, {
        ...taskData,
        tabId,
        tokenId,
        cookies,
        document: sessionId.split("-")[2], // Extract document from session ID
        createdAt: Date.now(),
        lastUsed: Date.now(),
        metadata: {
          userAgent: this.introHeaders["user-agent"],
          email: this.email,
        },
      });
      console.log(`✅ Session saved with ID: ${sessionId}`);
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  }

  /**
   * Load session using the new storage system
   */
  private async loadSession(): Promise<SessionData | null> {
    if (!NewCiService.sessionStorage) {
      return null;
    }
    const sessionId = this.sessionId;
    try {
      const sessionData = await NewCiService.sessionStorage.loadSession(sessionId);
      if (sessionData) {
        console.log(`✅ Session loaded with ID: ${sessionId}`);
        return {
          proInstId: sessionData.proInstId,
          proEleInstId: sessionData.proEleInstId,
          tabId: sessionData.tabId,
          tokenId: sessionData.tokenId,
          cookies: sessionData.cookies,
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Error loading session:", error);
      return null;
    }
  }

  /**
   * Delete session using the new storage system
   */
  private async deleteSession(): Promise<void> {
    if (!NewCiService.sessionStorage) return;
    const sessionId = this.sessionId;
    try {
      await NewCiService.sessionStorage.deleteSession(sessionId);
      console.log(`🗑️ Session deleted with ID: ${sessionId}`);
    } catch (error) {
      console.error("❌ Error deleting session:", error);
    }
  }

  jsonToQueryString(jsonData: any) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(jsonData)) {
      params.append(key, value as string);
    }

    return `${params.toString()}`;
  }

  async sendCaptchaSol(cookies: CookieInfo[], httpsAgent: https.Agent, tokenId: string, tabId: string) {
    const url = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=confirm&asXML=true&appletToken=&tabId=${tabId}&tokenId=${tokenId}`;
    const captchaSol = "354pn";

    const body = `1754148664040E_1361=${captchaSol}`;
  }

  getFields(xml: string) {
    const $ = load(xml, { xmlMode: true });

    // Buscamos los valores específicos por attName
    const getFieldValue = (attName: string) => $(`field[attName='${attName}']`).attr("value") || null;

    const cedula = getFieldValue("CRMRCSPS_NUMERO_DE_DOCUMENTO_STR");
    const primerNombre = getFieldValue("TRM_PERSONA_FISICA_NOMBRE_PRIMER_STR");
    const segundoNombre = getFieldValue("TRM_PERSONA_FISICA_NOMBRE_SEGUNDO_STR");
    const primerApellido = getFieldValue("TRM_PERSONA_FISICA_APELLIDO_PRIMER_STR");
    const segundoApellido = getFieldValue("TRM_PERSONA_FISICA_APELLIDO_SEGUNDO_STR");
    const fechaNacimiento = getFieldValue("CRMRCSPS_FECHA_DE_NACIMIENTO_DATE");

    const nombres = [primerNombre, segundoNombre].filter(Boolean).join(" ");
    const apellidos = [primerApellido, segundoApellido].filter(Boolean).join(" ");

    return {
      cedula,
      nombres,
      apellidos,
      fechaNacimiento,
    };
  }

  async fireFinalEvent(tokenId: string, tabId: string, cookie?: string) {
    const frmId = "6648";
    const attId = "8461";
    const html = await this.fireEventSingle(tokenId, tabId, frmId, attId, cookie);
    const $ = load(html);
    const htmlToParse = $("#E_6648").attr("data-xml");
    if (!htmlToParse) {
      throw new Error("#E_6648_not_found");
    }
    const fields = this.getFields(htmlToParse);
    return { ...fields, hasSession: false, hasRefreshed: false };
  }

  async fireEvents(tokenId: string, tabId: string) {
    // Aceptar términos y completar formulario del MEF de Consulta/Reclamación
    // o Denuncia en Materia de Relaciones de Consumo
    const events = [
      // Formulario MEF - Datos del trámite
      {
        frmId: "6687",
        attId: "12295",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "10988",
        value: "",
      },
      {
        frmId: "6368",
        attId: "10989",
        value: "1675089513605.png",
      },
      {
        frmId: "6368",
        attId: "10990",
        value: "",
      },
      {
        frmId: "6368",
        attId: "10991",
        value: "Usuario anónimo",
      },
      {
        frmId: "6368",
        attId: "10992",
        value: "1742495732743.png",
      },
      {
        frmId: "6368",
        attId: "10993",
        value: "https://www.gub.uy/ministerio-economia-finanzas/",
      },
      {
        frmId: "6368",
        attId: "1227",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "1228",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "1236",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "1239",
        value: "Consulta/Reclamación o Denuncia en Materia de Relaciones de Consumo",
      },
      {
        frmId: "6368",
        attId: "1265",
        value: "54",
      },
      {
        frmId: "6368",
        attId: "1269",
        value: this.email,
      },
      {
        frmId: "6368",
        attId: "1270",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "12792",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12800",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12801",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12802",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12803",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12804",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12805",
        value: "",
      },
      {
        frmId: "6368",
        attId: "12806",
        value: "",
      },
      {
        frmId: "6368",
        attId: "1569",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "1570",
        value: "2",
      },
      {
        frmId: "6368",
        attId: "1594",
        value: "2629",
      },
      {
        frmId: "6368",
        attId: "1604",
        value: "",
      },
      {
        frmId: "6368",
        attId: "1924",
        value: "SI",
      },
      {
        frmId: "6368",
        attId: "1925",
        value: "",
      },
      {
        frmId: "6368",
        attId: "1929",
        value: "",
      },
      {
        frmId: "6368",
        attId: "3957",
        value: "",
      },
      {
        frmId: "6368",
        attId: "4304",
        value: "",
      },
      {
        frmId: "6368",
        attId: "4305",
        value: "",
      },
      {
        frmId: "6368",
        attId: "5513",
        value: "",
      },
      {
        frmId: "6368",
        attId: "5514",
        value: "",
      },
      {
        frmId: "6368",
        attId: "5522",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "7378",
        value: "",
      },
      {
        frmId: "6368",
        attId: "7618",
        value: "2",
      },
      {
        frmId: "6368",
        attId: "7620",
        value: "1",
      },
      {
        frmId: "6368",
        attId: "7622",
        value: "",
      },
      {
        frmId: "6368",
        attId: "7845",
        value: "WEB_PC",
      },
      {
        frmId: "6368",
        attId: "7862",
        value: "externo",
      },
      {
        frmId: "6368",
        attId: "7922",
        value: "",
      },
    ];
    let prEvents = [];
    for (const { frmId, attId, value } of events) {
      if (frmId) prEvents.push(this.submitEntry(tokenId, tabId, attId, frmId, value));
    }
    await Promise.all(prEvents);
  }

  async fireAgreement(tokenId: string, tabId: string) {
    await this.fireEvents(tokenId, tabId);
    await this.checkSignableForms(tabId, tokenId);
  }

  async firePersonaFisicaEvent(tokenId: string, tabId: string, cookie?: string) {
    await this.fireAgreement(tokenId, tabId);
    const json = {
      frmId: "6647",
      attId: "8459",
      value: "1",
    };
    await this.submitEntry(tokenId, tabId, json.attId, json.frmId, "1");
    await this.fireEventSingle(tokenId, tabId, json.frmId, json.attId);
  }

  async fireEventSingle(tokenId: string, tabId: string, frmId: string, attId: string, cookie?: string) {
    const url = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run?action=fireFieldEvent&currentTab=forms~0&tabId=${tabId}&tokenId=${tokenId}&fldId=2&frmId=${frmId}&frmParent=E&index=0&evtId=1&attId=${attId}&react=true`;
    const headers = this.getDefaultHeaders();
    if (cookie) {
      headers.Cookie = cookie;
    }
    const res = await axios
      .post(url, "", {
        headers,
        httpsAgent: this.httpsAgent,
      })
      .catch((e) => {
        console.log("Status", e.response.status, url);
        return { data: "" };
      });

    return res.data as string;
  }

  /**
   * Extrae proInstId y proEleInstId de una respuesta XML
   * @param xmlResponse - La respuesta XML que contiene la URL con los parámetros
   * @returns Objeto con proInstId y proEleInstId extraídos
   */
  private extractProcessInstanceIds(xmlResponse: string): { proInstId: string; proEleInstId: string } | null {
    try {
      console.log(`🔍 Extracting process instance IDs from XML response...`);

      // Buscar el atributo url en el XML
      const urlMatch = xmlResponse.match(/url="([^"]+)"/);
      if (!urlMatch) {
        console.error("❌ No URL attribute found in XML response");
        return null;
      }

      let url = urlMatch[1];

      // Decodificar entidades HTML (&amp; -> &)
      url = url.replace(/&amp;/g, "&");

      console.log(`📡 Extracted URL: ${url}`);

      // Extraer proInstId y proEleInstId usando regex
      const proInstIdMatch = url.match(/proInstId=([^&]+)/);
      const proEleInstIdMatch = url.match(/proEleInstId=([^&]+)/);

      if (!proInstIdMatch || !proEleInstIdMatch) {
        console.error("❌ proInstId or proEleInstId not found in URL");
        return null;
      }

      const result = {
        proInstId: proInstIdMatch[1],
        proEleInstId: proEleInstIdMatch[1],
      };

      console.log(`✅ Extracted process IDs:`, result);
      return result;
    } catch (error) {
      console.error("❌ Error extracting process instance IDs:", error);
      return null;
    }
  }

  /**
   * Convierte parámetros de URL a objeto JSON
   * @param urlParams - Cadena de parámetros URL (ej: "&tabId=123&tokenId=456")
   * @returns Objeto JSON con los parámetros parseados
   */
  private parseUrlParamsToJson(urlParams: string): Record<string, string> {
    try {
      // Remover el & inicial si existe
      const cleanParams = urlParams.startsWith("&") ? urlParams.substring(1) : urlParams;

      // Usar URLSearchParams para parsear de forma segura
      const searchParams = new URLSearchParams(cleanParams);

      const result: Record<string, string> = {};

      // Convertir a objeto
      searchParams.forEach((value, key) => {
        result[key] = value;
      });

      console.log(`🔍 Parsed URL params:`, result);
      return result;
    } catch (error) {
      console.error("❌ Error parsing URL params:", error);
      return {};
    }
  }

  /**
   * Extrae específicamente tabId y tokenId de parámetros URL
   * @param urlParams - Cadena de parámetros URL
   * @returns Objeto con tabId y tokenId
   */
  private extractTabAndTokenIds(urlParams: string): { tabId: string; tokenId: string } {
    try {
      const params = this.parseUrlParamsToJson(urlParams);

      return {
        tabId: params.tabId as string,
        tokenId: params.tokenId as string,
      };
    } catch (error) {
      console.error("❌ Error extracting tab and token IDs:", error);
      return { tabId: "", tokenId: "" };
    }
  }

  /**
   * Extrae el valor de TAB_ID_REQUEST del HTML response
   * @param htmlContent - El contenido HTML donde buscar
   * @returns El valor de TAB_ID_REQUEST o null si no se encuentra
   */
  private extractTabIdRequest(htmlContent: string): { tabId: string; tokenId: string } | null {
    try {
      // Expresión regular para capturar el valor entre var TAB_ID_REQUEST y ;
      const tabIdPattern = /var\s+TAB_ID_REQUEST\s*=\s*['"]*([^'";]+)['"]*\s*;/i;
      const match = htmlContent.match(tabIdPattern);

      if (match && match[1]) {
        const tabIdValue = match[1].trim();
        console.log(`🔍 Extracted TAB_ID_REQUEST: ${tabIdValue}`);
        return this.extractTabAndTokenIds(tabIdValue);
      }

      console.log("⚠️ TAB_ID_REQUEST not found in HTML content");
      return null;
    } catch (error) {
      console.error("❌ Error extracting TAB_ID_REQUEST:", error);
      return null;
    }
  }

  getDefaultHeaders() {
    return {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "es-ES,es;q=0.9",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: this.cookies,
      Origin: "https://www.tramitesenlinea.mef.gub.uy",
      Referer: "https://www.tramitesenlinea.mef.gub.uy/Apia/portal/tramite.jsp?id=2629",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    };
  }

  async redirect() {
    const data = "onFinishURL=https%3A%2F%2Fwww.tramitesenlinea.mef.gub.uy%2FApia%2Fportal%2FredirectSLO.jsp&id=2629&tabId=1&lang=1&eatt_STR_TRM_COD_TRAMITE_STR=54&react=true&eatt_STR_TRM_MODO_AUTENTICACION_STR=1&logFromFile=true&proCode=1163&eatt_STR_TRM_CANAL_AUTENTICACION_STR=IDURUGUAY&env=1&onFinish=5&type=P&eatt_STR_TRM_VISIBILIDAD_STR=1&entCode=1006&eatt_str_TRM_CANAL_INICIO_STR=WEB_PC";
    const url = "https://www.tramitesenlinea.mef.gub.uy/Apia/page/externalAccess/open.jsp";

    // Perform the GET request
    const response = await axios.post(url, data, {
      timeout: 10000, // 10 second timeout
      httpsAgent: this.httpsAgent, // Use the custom HTTPS agent
      maxRedirects: 5, // Follow up to 5 redirects
      headers: this.getDefaultHeaders(),
    });

    console.log("Status", response.status);
    const cookies = this.extractCookiesStr(response);

    //this.cookies = this.extractCookiesStr(response);
    const tabReq = this.extractTabIdRequest(response.data);
    if (!tabReq) throw new Error("Could not extract tabId and tokenId from response");
    const { tabId, tokenId } = tabReq;

    //
    return { tabId, tokenId };
  }

  async submitEntry(tokenId: string, tabId: string, attId: string, frmId: string, value: string): Promise<boolean> {
    const timestamp = Date.now();
    const url = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run?action=processFieldSubmit&isAjax=true&react=true&tabId=${tabId}&tokenId=${tokenId}&timestamp=${timestamp}&attId=${attId}&frmId=${frmId}&index=0&frmParent=E&timestamp=${timestamp}`;
    const body = `value=${encodeURIComponent(value)}`;
    const headers = this.getDefaultHeaders();

    // Perform the GET request
    const res = await axios.post(url, body, {
      timeout: 10000, // 10 second timeout
      httpsAgent: this.httpsAgent, // Use the custom HTTPS agent
      maxRedirects: 5, // Follow up to 5 redirects
      validateStatus: (status) => status < 500, // Accept all status codes below 500
      headers,
    });
    if (!res.data.includes('success="true"') || res.data.includes("Error del sistema")) {
      console.error("Roto", frmId, attId, value);
      if (attId === "12295") throw new Error("Agreement broken, stop");
    }
    return res.data && res.data.includes('success="true"');
  }

  async fillEmail(tokenId: string, tabId: string) {
    const attId = "11638";
    const frmId = "1361";
    await this.submitEntry(tokenId, tabId, attId, frmId, this.email);
  }

  async queryCy(document: string, tokenId: string, tabId: string): Promise<boolean> {
    const attId = "8461";
    const frmId = "6648";
    const res = await this.submitEntry(tokenId, tabId, attId, frmId, document);
    return res;
  }

  getCookieString(cookies: CookieInfo[]) {
    const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(";");
    return cookieString;
  }

  async generateTask(tabId: string, tokenId: string, formData: string) {
    const url = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=checkWizzard&tabId=${tabId}&tokenId=${tokenId}`;
    const res = await axios.post(url, "", {
      timeout: 5000,
      httpsAgent: this.httpsAgent,
      headers: this.getDefaultHeaders(),
    });
    const data = res.data;
    const proInstIds = this.extractProcessInstanceIds(data);
    if (!proInstIds) throw new Error("Unable to track process");
    const { proInstId, proEleInstId } = proInstIds;
    const urlAgain = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=getTask&proInstId=${proInstId}&proEleInstId=${proEleInstId}&fromWizzard=true&tabId=${tabId}&tokenId=${tokenId}&react=true`;
    // Send captcha again
    await axios.post(urlAgain, formData, {
      timeout: 5000,
      httpsAgent: this.httpsAgent,
      headers: this.getDefaultHeaders(),
    });
    return { proInstId, proEleInstId };
  }

  /**
   * Extrae la URL del workArea desde el código JavaScript embebido en HTML
   * @param htmlContent - El contenido HTML que contiene el script con workArea
   * @returns La URL extraída o null si no se encuentra
   */
  extractWorkAreaSrc(htmlContent: string): string | null {
    try {
      if (!htmlContent || typeof htmlContent !== "string") {
        console.warn("⚠️ Invalid HTML content provided to extractWorkAreaSrc");
        return null;
      }

      // Patrón para buscar document.getElementById("workArea").src="[URL]"
      const workAreaPattern = /document\.getElementById\s*\(\s*["']workArea["']\s*\)\s*\.src\s*=\s*["']([^"']+)["']/i;

      const match = htmlContent.match(workAreaPattern);

      if (match && match[1]) {
        const extractedUrl = match[1].trim();
        console.log(`✅ WorkArea URL extraída: ${extractedUrl}`);
        return extractedUrl;
      }

      console.log("⚠️ No se encontró workArea.src en el contenido HTML");
      return null;
    } catch (error) {
      console.error("❌ Error extrayendo workArea.src:", error);
      return null;
    }
  }

  async refreshCookies(proInstId: string, proEleInstId: string, tabId: string, tokenId: string): Promise<{ cookies: string; tabId: string; tokenId: string }> {
    try {
      const nroTramite = parseInt(proInstId) - 8157;
      const url = `https://www.tramitesenlinea.mef.gub.uy/Apia/page/externalAccess/workTask.jsp?logFromFile=true&env=1&lang=1&numInst=TRM_PRTL_${nroTramite}&onFinish=5&onFinishURL=https://www.gub.uy/ministerio-economia-finanzas/&eatt_str_TRM_RETOMA_TRAMITE_STR=SI&eat_str_TRM_ACCESO_EXTERNO_STR=true`;
      const headers = this.getDefaultHeaders();
      headers.Cookie = "";
      const response = await axios.get(url, {
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers,
      });
      const cookies = this.extractCookiesStr(response);
      if (response.data.includes(proInstId)) {
        console.log("Task matches");
        headers.Cookie = cookies;
        const newUrl = this.extractWorkAreaSrc(response.data);
        if (!newUrl) {
          console.error("❌ No se pudo extraer la URL del workArea");
          throw new Error("work_area_url_not_found");
        }
        const toGo = `https://www.tramitesenlinea.mef.gub.uy/${newUrl}`;
        const newTabId = newUrl.split("tabId=")[1].split("&")[0];
        const newTokenId = newUrl.split("tokenId=")[1].split("&")[0];
        if (!newTabId || !newTokenId) {
          console.error("❌ No se pudo extraer tabId o tokenId de la URL del workArea");
          throw new Error("tab_or_token_id_not_found");
        }
        const resF = await axios.get(toGo, {
          timeout: 10000,
          httpsAgent: this.httpsAgent,
          headers: headers,
        });
        return {
          cookies: cookies,
          tabId: newTabId,
          tokenId: newTokenId,
        };
      }
      throw new Error("redirect_task_not_matching");
    } catch (e) {
      console.error(e);
      return {
        cookies: "",
        tabId: "",
        tokenId: "",
      };
    }
  }

  fixWhiteSpaces(str: string) {
    if (!str) return "";
    return str.replace(/\s+/g, " ").trim();
  }

  async check(document: string, options?: any, att?: number): Promise<NewCiResponse> {
    const anvService = new ANV();
    const res = await anvService.buscarPersona(document).then((response) => response);

    if (res.success && res.data) {
      return {
        cedula: document,
        nombres: this.fixWhiteSpaces(res.data.primer_nombre?.trim() + " " + res.data.segundo_nombre?.trim()),
        apellidos: this.fixWhiteSpaces(res.data.primer_apellido?.trim() + " " + res.data.segundo_apellido?.trim()),
        fechaNacimiento: res.data.fecha_nacimiento?.trim(),
      };
    }

    return {
      cedula: document,
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
    };
  }

  /**
   * Performs a GET request to the MEF portal and saves the response
   * This method uses the MEF "Consulta/Reclamación o Denuncia en Materia de Relaciones de Consumo" form
   * to access citizen information through the official government portal.
   * @param document - The document number to check
   * @param options - Optional parameters for the check
   * @param options.ignoreCache - If true, bypasses cache and performs a fresh check
   * @returns Promise<any> - The response data
   */
  async checkOld(document: string, options?: { ignoreCache?: boolean; forceRefresh?: boolean }, att = 0): Promise<NewCiResponse> {
    let hasRefreshed = false;
    try {
      // ignoreCache not implemented.
      console.log(`Checking document number: ${document}`);

      // Try to load existing session for this document
      const existingSession = await this.loadSession();

      let tokenId = existingSession?.tokenId as string;
      let tabId = existingSession?.tabId as string;
      this.cookies = existingSession?.cookies as string;
      let proInstId = existingSession?.proInstId as string;
      let proEleInstId = existingSession?.proEleInstId as string;
      const hasSession = !!proInstId;
      if (hasSession) {
        const sessionWorking = await this.queryCy(document, tokenId, tabId);
        if (!sessionWorking || options?.forceRefresh) {
          console.log(`🔄 Reusing existing session: tabId=${tabId}, tokenId=${tokenId}`);
          const resCookies = await this.refreshCookies(proInstId, proEleInstId, tabId, tokenId);
          console.log("ResCookies", resCookies);
          if (resCookies.cookies) {
            hasRefreshed = true;
            this.cookies = resCookies.cookies;
            tabId = resCookies.tabId;
            tokenId = resCookies.tokenId;
            console.log(`🔄 Cookies refreshed: tabId=${tabId}, tokenId=${tokenId}`);
          }
        }
      }

      if (!hasSession) {
        const shouldIgnoreCache = options?.ignoreCache || false;

        if (shouldIgnoreCache) {
          console.log(`🚫 Cache bypass requested, performing fresh check for: ${document}`);
        }

        // Perform the GET request
        const response = await axios.get(this.targetUrl, {
          timeout: 10000, // 10 second timeout
          httpsAgent: this.httpsAgent, // Use the custom HTTPS agent
          maxRedirects: 10, // Follow up to 5 redirects
          headers: this.introHeaders,
        });

        this.cookies = this.extractCookiesStr(response);

        const res1 = await this.redirect();
        tabId = res1.tabId;
        tokenId = res1.tokenId;
        console.log(`🔍 Redirected to tabId: ${tabId}, tokenId: ${tokenId}`);
        await this.fillEmail(tokenId, tabId);

        let captchaSolved = "";
        let formData = "";
        let nextStepResult = null;
        let att = 0;
        while (!captchaSolved && att < 10) {
          console.log("Att", att, 10);
          nextStepResult = await this.performNextStepRequest(tabId, tokenId);
          captchaSolved = nextStepResult.captchaSolved;
          formData = nextStepResult.formData;
          att++;
        }

        if (!formData) {
          throw new Error("captcha_not_solved");
        }

        const prIds = await this.generateTask(tabId, tokenId, formData);
        proInstId = prIds.proInstId;
        proEleInstId = prIds.proEleInstId;
        await this.firePersonaFisicaEvent(tokenId, tabId);
      }
      await this.queryCy(document, tokenId, tabId);
      let res = await this.fireFinalEvent(tokenId, tabId);
      res.hasSession = hasSession;
      res.hasRefreshed = hasRefreshed;
      if (res && res.cedula) {
        console.log(`✅ Document ${document} found:`, res);

        // Save session using new storage system
        await this.saveSession(tabId, tokenId, this.cookies, { proInstId, proEleInstId });
      } else {
        // No existe persona con esa identificación
        res = {
          cedula: "",
          nombres: "",
          apellidos: "",
          fechaNacimiento: "",
          hasSession,
          hasRefreshed,
        };
      }
      return res as NewCiResponse;
    } catch (error: any) {
      // Clear session on error
      await this.deleteSession();
      console.error(`❌ Error checking document ${document}:`, error);
      // Save error response to JSON file
      if (error?.message === "#E_6648_not_found" && att < 3) {
        console.log("Retrying due to missing #E_6648 element...");
        return this.check(document, { ignoreCache: false, forceRefresh: false }, att + 1);
      }
      throw error;
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    // Not done.
    return true;
  }

  async queryCiInfo(ci: string): Promise<CiQueryResponse> {
    await NewCiService.initializeSessionStorage();
    try {
      const res: NewCiResponse = await this.check(ci);

      // Procesar fecha de nacimiento si existe
      let fechaNacimientoDate: Date | null = null;
      let edad: number | null = null;

      if (res.fechaNacimiento) {
        try {
          const fechaInfo = DateUtils.procesarFechaNacimiento(res.fechaNacimiento);
          if (fechaInfo) {
            fechaNacimientoDate = fechaInfo.fechaDate;
            edad = fechaInfo.edad;
          }
        } catch (error) {
          console.warn("Error procesando fecha de nacimiento:", error);
        }
      }

      // Analizar información adicional de la persona
      const infoAdicional = PersonaUtils.analizarPersona(res.nombres, res.apellidos, edad || undefined);

      return {
        success: true,
        data: {
          persona: {
            nombre: res.nombres,
            apellido: res.apellidos,
            fechaNacimiento: res.fechaNacimiento,
            fechaNacimientoDate: fechaNacimientoDate,
            edad: edad,
            cedula: res.cedula,
            // Información adicional
            genero: infoAdicional.genero,
            iniciales: infoAdicional.iniciales,
            nombreCompleto: infoAdicional.nombreCompleto,
            longitudNombre: infoAdicional.longitudNombre,
            tieneSegundoNombre: infoAdicional.tieneSegundoNombre,
            cantidadNombres: infoAdicional.cantidadNombres,
            generacion: infoAdicional.generacion,
          },
          message: (res as any).error || "Consulta exitosa",
          status: 200,
        },
      };
    } catch (error) {
      console.error(error);
      return this.handleError(error);
    }
  }

  /**
   * Maneja errores de la consulta externa
   */
  private handleError(error: any): CiQueryResponse {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Timeout: El servicio no respondió en el tiempo esperado",
        };
      }

      if (error.response) {
        return {
          success: false,
          error: `Error del servidor: ${error.response.status} - ${error.response.statusText}`,
        };
      }

      if (error.request) {
        return {
          success: false,
          error: "Error de conexión: No se pudo conectar con el servicio",
        };
      }
    }

    return {
      success: false,
      error: `Error inesperado: ${error.message || "Error desconocido"}`,
    };
  }

  async checkWithCookies(document: string, cookie: string, tokenId: string, tabId: string) {
    this.cookies = cookie;
    await this.firePersonaFisicaEvent(tokenId, tabId, cookie);
    await this.queryCy(document, tokenId, tabId);
    const res = await this.fireFinalEvent(tokenId, tabId);
    return res;
  }

  private extractCookiesStr(response: AxiosResponse) {
    const cookies = this.extractCookies(response);
    return this.getCookieString(cookies);
  }

  /**
   * Extracts cookies from the response headers
   * @param response - The axios response object
   * @returns Array of cookie information
   */
  private extractCookies(response: AxiosResponse): CookieInfo[] {
    const cookies: CookieInfo[] = [];
    const setCookieHeader = response.headers["set-cookie"];

    if (setCookieHeader) {
      setCookieHeader.forEach((cookieString) => {
        const cookieParts = cookieString.split(";");
        const [nameValue] = cookieParts;
        const [name, value] = nameValue.split("=");

        if (name && value && name === "JSESSIONID") {
          cookies.push({
            name: name.trim(),
            value: value.trim(),
            domain: this.extractCookieAttribute(cookieParts, "domain"),
            path: this.extractCookieAttribute(cookieParts, "path"),
          });
        }
      });
    }

    return cookies;
  }

  /**
   * Extracts a specific attribute from cookie parts
   * @param cookieParts - Array of cookie parts
   * @param attribute - The attribute to extract
   * @returns The attribute value or undefined
   */
  private extractCookieAttribute(cookieParts: string[], attribute: string): string | undefined {
    for (const part of cookieParts) {
      if (
        part
          .trim()
          .toLowerCase()
          .startsWith(attribute.toLowerCase() + "=")
      ) {
        return part.split("=")[1]?.trim();
      }
    }
    return undefined;
  }

  async fetchExtractedUrl(url: string, httpsAgent: https.Agent, cookieString: string): Promise<any> {
    const iframeResponse = await axios
      .get(url, {
        timeout: 10000,
        httpsAgent: httpsAgent,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          Cookie: cookieString,
          Referer: this.targetUrl,
          "Sec-Fetch-Dest": "iframe",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Upgrade-Insecure-Requests": "1",
        },
      })
      .then((res) => res.data);
    return iframeResponse;
  }

  private async asyncCheckAction(url: string, tabId: string, tokenId: string) {
    const response = await axios.post(url + `&tabId=${tabId}&tokenId=${tokenId}`, "", {
      timeout: 10000,
      httpsAgent: this.httpsAgent,
      headers: this.getDefaultHeaders(),
    });

    return {
      url,
      tabId,
      tokenId,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      responseData: response.data,
      hasSignableForms: response.data && (response.data.includes("true") || response.data.includes("signable")),
    };
  }

  /**
   * Checks if there are signable forms before proceeding to next step
   * @param refererUrl - The referer URL from the extracted iframe URL
   * @param tabId - The tab ID from previous requests
   * @param tokenId - The token ID from previous requests
   * @param cookies - Session cookies
   * @param httpsAgent - HTTPS agent for requests
   * @returns Promise<any> - The signable forms check response
   */
  private async checkSignableForms(tabId: string, tokenId: string): Promise<any> {
    try {
      const documentsLockUrl = "https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=checkWebDavDocumentsLocks&isAjax=true";

      // Build the hasSignableForms URL
      const signableFormsUrl = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=hasSignableForms&appletToken=`;

      const goToNextUrl = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=gotoNextStep&currentTab=forms~32&fromPanel=null&react=true`;

      //await this.asyncCheckAction(documentsLockUrl, tabId, tokenId);
      //const res = await this.asyncCheckAction(signableFormsUrl, tabId, tokenId);
      await this.asyncCheckAction(goToNextUrl, tabId, tokenId);
      //return res;s
      // Create cookie string for requests
    } catch (error) {
      console.error(`❌ Error checking signable forms:`, error);

      return {
        tabId,
        tokenId,
        responseData: (error as any).response?.data,
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Solves CAPTCHA using OCR with serverless-compatible configuration
   * @param captchaUrl - The URL of the CAPTCHA image
   * @param cookies - Session cookies
   * @param httpsAgent - HTTPS agent for requests
   * @returns Promise<string> - The solved CAPTCHA text
   */
  private async solveCaptcha(captchaUrl: string): Promise<string> {
    try {
      // Download the CAPTCHA image
      const imageResponse = await axios.get(captchaUrl, {
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9",
          Cookie: this.cookies,
          Host: "www.tramitesenlinea.mef.gub.uy",
          Referer: "https://www.tramitesenlinea.mef.gub.uy/Apia/page/externalAccess/open.jsp",
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
        },
      });

      // For Vercel serverless environment, use external OCR API
      const hasApiOcr = !!process.env.OCR_API_URL;
      if (hasApiOcr) {
        console.log("🌐 Running in Vercel serverless environment - using external OCR API");
        const captchaBase64 = `data:image/png;base64,${imageResponse.data.toString("base64")}`;
        try {
          // Use external OCR API to avoid WASM issues
          const ocrApiUrl = process.env.OCR_API_URL || "http://localhost:3001";
          const ocrResponse = await axios.post(
            `${ocrApiUrl}/ocr/captcha`,
            {
              imageUrl: captchaBase64,
              cookies: this.cookies,
              useAdvanced: true,
              options: {
                whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                serverless: true,
              },
            },
            {
              timeout: 30000, // 30 second timeout for OCR processing
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "PhoneChecker/1.0",
              },
            }
          );

          console.log("Ocr response", ocrResponse.data);

          if (ocrResponse.data.success && ocrResponse.data.cleanedText) {
            const cleanText = ocrResponse.data.cleanedText;
            console.log(`🔍 CAPTCHA solved via external OCR API: "${cleanText}" (confidence: ${ocrResponse.data.confidence})`);
            // Save captcha with the name as cleanText in /captcha_solved folder.
            return cleanText;
          } else {
            throw new Error(`External OCR API failed: ${ocrResponse.data.error || "Unknown error"}`);
          }
        } catch (externalOcrError) {
          console.error("❌ External OCR API failed:", externalOcrError);
          console.log("🔄 Using smart CAPTCHA fallback for serverless environment");

          // Return a smart fallback value
          return this.generateSmartCaptchaFallback();
        }
      }

      // Save the CAPTCHA image temporarily (use /tmp in serverless environments)
      const tempDir = process.env.VERCEL ? "/tmp" : NewCiService.outputDir;
      const captchaImagePath = path.join(tempDir, `captcha_${Date.now()}.png`);
      await fs.writeFile(captchaImagePath, imageResponse.data);
      console.log(`📄 CAPTCHA image saved to: ${captchaImagePath}`);

      // Local development - use full featured OCR
      console.log("🏠 Running in local environment - using advanced OCR");

      // Initialize Tesseract worker with better language support
      const worker = await createWorker(["eng"]);

      // Configure Tesseract for optimal CAPTCHA recognition
      await worker.setParameters({
        // Character whitelist - only alphanumeric characters
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        // Page segmentation mode - treat the image as a single text line
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        // OCR Engine Mode - use both legacy and LSTM engines for better accuracy
        tessedit_ocr_engine_mode: OEM.TESSERACT_LSTM_COMBINED,
        // Improve recognition for small text
        tessedit_do_invert: "1",
        // Additional parameters for better CAPTCHA recognition
        classify_enable_learning: "0",
        classify_enable_adaptive_matcher: "0",
        textord_really_old_xheight: "1",
        textord_min_xheight: "10",
        preserve_interword_spaces: "0",
        // Improve edge detection
        edges_max_children_per_outline: "40",
        // Noise reduction
        textord_noise_sizelimit: "0.5",
        // Improve character recognition
        tessedit_char_unblacklist: "",
        // Better handling of small fonts
        textord_min_linesize: "2.5",
      });

      // Recognize text from the CAPTCHA image with multiple attempts
      let recognitionResults = [];

      // Try recognition with different configurations
      const configs = [
        { psr: PSM.SINGLE_LINE, oem: OEM.TESSERACT_LSTM_COMBINED },
        { psr: PSM.SINGLE_WORD, oem: OEM.LSTM_ONLY },
        { psr: PSM.SINGLE_CHAR, oem: OEM.TESSERACT_ONLY },
        { psr: PSM.RAW_LINE, oem: OEM.TESSERACT_LSTM_COMBINED },
      ];

      for (const config of configs) {
        try {
          await worker.setParameters({
            tessedit_pageseg_mode: config.psr,
            tessedit_ocr_engine_mode: config.oem,
          });

          const {
            data: { text, confidence },
          } = await worker.recognize(captchaImagePath);
          const cleanText = this.cleanCaptchaText(text);

          if (cleanText && cleanText.length >= 4 && cleanText.length <= 8) {
            recognitionResults.push({
              text: cleanText,
              confidence: confidence,
              config: config,
            });
          }
        } catch (configError) {
          console.warn(`Recognition attempt failed with config:`, config, configError);
        }
      }

      // Sort by confidence and length preference
      recognitionResults.sort((a, b) => {
        // Prefer results with length 5-6 (typical CAPTCHA length)
        const aLengthScore = Math.abs(a.text.length - 5.5);
        const bLengthScore = Math.abs(b.text.length - 5.5);

        if (Math.abs(aLengthScore - bLengthScore) > 0.5) {
          return aLengthScore - bLengthScore;
        }

        // Then prefer higher confidence
        return b.confidence - a.confidence;
      });

      const bestResult = recognitionResults[0];
      const cleanText = bestResult ? bestResult.text : this.cleanCaptchaText((await worker.recognize(captchaImagePath)).data.text);

      console.log(`🔍 CAPTCHA recognition results:`, recognitionResults.slice(0, 3));
      console.log(`🔍 CAPTCHA solved: "${cleanText}" (confidence: ${bestResult?.confidence || "unknown"})`);

      // Clean up
      await worker.terminate();

      // Optionally delete the temporary image file
      try {
        await fs.unlink(captchaImagePath);
        console.log(`🗑️ Temporary CAPTCHA image deleted: ${captchaImagePath}`);
      } catch (error) {
        console.warn(`Warning: Could not delete temporary CAPTCHA image: ${error}`);
      }

      // Validate the result
      if (!cleanText || cleanText.length < 3) {
        throw new Error(`CAPTCHA recognition failed or result too short: "${cleanText}"`);
      }

      return cleanText;
    } catch (error) {
      console.error(`❌ Error solving CAPTCHA:`, error);

      // Return a fallback value or throw error
      throw new Error(`Failed to solve CAPTCHA: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Cleans and normalizes CAPTCHA text recognition results
   * @param rawText - Raw text from OCR recognition
   * @returns Cleaned text suitable for CAPTCHA submission
   */
  private cleanCaptchaText(rawText: string): string {
    if (!rawText) return "";

    // Remove all non-alphanumeric characters
    let cleaned = rawText.replace(/[^a-zA-Z0-9]/g, "");

    // Common OCR misrecognitions for CAPTCHAs
    const corrections: { [key: string]: string } = {
      "0": "O", // Zero to letter O
      O: "0", // Letter O to zero (try both)
      "1": "I", // One to letter I
      I: "1", // Letter I to one
      "5": "S", // Five to letter S
      S: "5", // Letter S to five
      "6": "G", // Six to letter G
      G: "6", // Letter G to six
      "8": "B", // Eight to letter B
      B: "8", // Letter B to eight
      "2": "Z", // Two to letter Z
      Z: "2", // Letter Z to two
    };

    // Apply corrections and return multiple possibilities
    const possibilities = [cleaned];

    // Try common substitutions
    for (const [from, to] of Object.entries(corrections)) {
      if (cleaned.includes(from)) {
        possibilities.push(cleaned.replace(new RegExp(from, "g"), to));
      }
    }

    // Return the original cleaned text (we might want to try alternatives later)
    return cleaned;
  }

  /**
   * Generates a fallback CAPTCHA value when OCR fails in serverless environments
   * @returns A reasonable CAPTCHA guess based on common patterns
   */
  private generateCaptchaFallback(): string {
    // Generate a 5-character alphanumeric string as a fallback
    // This won't work most of the time, but provides a reasonable attempt
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    // Use timestamp-based pseudo-randomness for consistency
    const timestamp = Date.now();
    for (let i = 0; i < 5; i++) {
      const index = (timestamp + i * 17) % chars.length;
      result += chars[index];
    }

    console.log(`🔄 Generated CAPTCHA fallback: "${result}"`);
    return result;
  }

  /**
   * Generates a smarter CAPTCHA fallback with multiple strategies
   * @returns A better CAPTCHA guess based on common CAPTCHA patterns
   */
  private generateSmartCaptchaFallback(): string {
    // Common CAPTCHA patterns and lengths
    const strategies = [
      // 5-character mixed alphanumeric (most common)
      () => this.generateRandomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
      // 4-character mixed
      () => this.generateRandomString(4, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
      // 6-character mixed
      () => this.generateRandomString(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
      // Numbers only (sometimes CAPTCHAs are numeric)
      () => this.generateRandomString(5, "0123456789"),
      // Letters only (sometimes CAPTCHAs are alphabetic)
      () => this.generateRandomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    ];

    // Use timestamp to select strategy (but make it deterministic for retry consistency)
    const timestamp = Date.now();
    const strategyIndex = Math.floor(timestamp / 10000) % strategies.length;
    const result = strategies[strategyIndex]();

    console.log(`🎯 Generated smart CAPTCHA fallback (strategy ${strategyIndex + 1}): "${result}"`);
    return result;
  }

  /**
   * Generates a random string with specified length and character set
   * @param length - Length of the string to generate
   * @param chars - Character set to use
   * @returns Random string
   */
  private generateRandomString(length: number, chars: string): string {
    let result = "";
    const timestamp = Date.now();

    for (let i = 0; i < length; i++) {
      // Use timestamp + position for pseudo-randomness (deterministic for retry consistency)
      const index = (timestamp + i * 23 + length * 7) % chars.length;
      result += chars[index];
    }

    return result;
  }

  /**
   * Generates the CAPTCHA URL and name from the form data
   * @param tabId - The tab ID from previous requests
   * @returns Object containing CAPTCHA URL and name
   */
  private generateCaptchaInfo(tabId: string): { captchaUrl: string; captchaName: string } {
    const captchaName = `${tabId}E_1361`;

    const captchaUrl = `https://www.tramitesenlinea.mef.gub.uy/Apia/captchaImg?captchaName=${captchaName}&t=${this.timestamp}`;

    return { captchaUrl, captchaName };
  }

  /**
   * Performs the final "go to next step" request after phone validation
   * @param refererUrl - The referer URL from the extracted iframe URL
   * @param tabId - The tab ID from previous requests
   * @param tokenId - The token ID from previous requests
   * @param cookies - Session cookies
   * @param httpsAgent - HTTPS agent for requests
   * @param phoneNumber - The phone number to validate
   * @returns Promise<any> - The next step response
   */
  private async performNextStepRequest(tabId: string, tokenId: string): Promise<any> {
    try {
      // Build the next step URL using TaskAction.run with gotoNextStep action
      const nextStepUrl = `https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.TaskAction.run?action=confirm&asXML=true&appletToken=&tabId=${tabId}&tokenId=${tokenId}`;

      // Generate CAPTCHA info and solve it with retry logic
      const { captchaUrl, captchaName } = this.generateCaptchaInfo(tabId);
      let captchaSolution = "";
      let attempts = 0;
      const maxAttempts = 3;

      while (!captchaSolution && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`🎯 CAPTCHA solving attempt ${attempts}/${maxAttempts}`);
          captchaSolution = await this.solveCaptcha(captchaUrl);

          // Validate CAPTCHA solution length
          if (captchaSolution.length < 3 || captchaSolution.length > 8) {
            console.warn(`⚠️ CAPTCHA solution seems invalid (length: ${captchaSolution.length}): "${captchaSolution}"`);
            if (attempts < maxAttempts) {
              captchaSolution = ""; // Reset to retry
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
              continue;
            }
          }
        } catch (captchaError) {
          console.error(`❌ CAPTCHA solving attempt ${attempts} failed:`, captchaError);
          if (attempts >= maxAttempts) {
            throw new Error(`Failed to solve CAPTCHA after ${maxAttempts} attempts: ${captchaError}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      console.log(`🔤 Final CAPTCHA solution: ${captchaSolution}`);

      // Prepare form data with solved CAPTCHA
      const formData = `${captchaName}=${captchaSolution}`;

      console.log(`🔍 Performing next step request...`);
      console.log(`📡 Request URL: ${nextStepUrl}`);
      console.log(`📝 Form data: ${formData}`);
      console.log(`🎯 CAPTCHA URL: ${captchaUrl}`);
      console.log(`🔤 CAPTCHA solution: ${captchaSolution}`);

      const headers = {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "es-419,es;q=0.9",
        Connection: "keep-alive",
        "Content-Length": "25",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.cookies,
        Host: "www.tramitesenlinea.mef.gub.uy",
        Origin: "https://www.tramitesenlinea.mef.gub.uy",
        Referer: "https://www.tramitesenlinea.mef.gub.uy/Apia/page/externalAccess/open.jsp",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      };
      const response = await axios.post(nextStepUrl, formData, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers,
      });
      const data = response.data;
      if (data && (data.includes("incorrecto") || data.includes("Error del sistema"))) {
        // Captcha incorrecto.
        console.log("Form Data", formData);
        throw new Error("captcha_failed");
      }

      return {
        formData,
        captchaSolved: true,
      };
    } catch (error: any) {
      console.error(`❌ Error performing next step request:`, error?.response?.status || error.message);
      console.log("cookies", this.cookies);
      return {
        formData: "",
        captchaSolved: false,
      };
    }
  }
}
