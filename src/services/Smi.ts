import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import * as crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Request interface for SMI API
export interface SmiRequest {
  ci: string;
}

// Response interface for SMI API
export interface SmiMember {
  ci: string;
  userData?: ExtractedUserData;
  status: "registered" | "not_registered";
  executionTime: number;
}

export interface SmiResponse {
  success: boolean;
  hasUser: boolean;
  member?: SmiMember;
  error?: string;
}

// Interface for extracted user data from HTML
export interface ExtractedUserData {
  perID?: string;
  perCI?: string;
  perMail?: string;
  domicTel?: string;
  tipoCodigoRecuperacion?: string;
  metodos?: Array<{ tipo: string; descripcion: string }>;
  mensaje?: string;
  isValidUser: boolean;
}

// Raw API response interface - SMI uses GeneXus framework
interface SmiApiResponse {
  vCUSTOMER_NAME?: string;
  vMSG?: string;
  vISOK?: boolean;
  vSUCCESS?: boolean;
  // GeneXus standard response fields
  events?: any[];
  messages?: any[];
  variables?: any;
}

export class SmiService {
  private readonly loginUrl = "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpauglogin";
  private readonly baseUrl = "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpaugrecuperarpassword";

  // Session data storage
  private sessionData: {
    jsessionId?: string;
    gxSessionId?: string;
    ajaxSecurityToken?: string;
    gxAuthToken?: string;
    gxAjaxKey?: string;
    recoveryPageHash?: string;
  } = {};

  private readonly headers = {
    Accept: "*/*",
    "Accept-Language": "es-ES,es;q=0.9,bg;q=0.8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    GxAjaxRequest: "1",
    Origin: "https://reservasweb.smi.com.uy",
    Pragma: "no-cache",
    Referer: "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpaugrecuperarpassword",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  /**
   * Create axios instance with proxy configuration if available
   * @returns Configured axios instance
   */
  private createAxiosInstance() {
    const config: any = {
      timeout: 40000,
    };

    // Support for simple PROXY URL format (e.g., http://179.27.158.18:80)
    if (process.env.PROXY) {
      try {
        const proxyUrl = new URL(process.env.PROXY);
        config.proxy = {
          protocol: proxyUrl.protocol.replace(':', ''),
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port, 10),
        };

        // Add proxy authentication if provided in URL
        if (proxyUrl.username && proxyUrl.password) {
          config.proxy.auth = {
            username: proxyUrl.username,
            password: proxyUrl.password,
          };
        }
      } catch (error) {
        console.error('Invalid PROXY URL format:', process.env.PROXY, error);
      }
    } 
    // Fallback to individual environment variables for backward compatibility
    else if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
      config.proxy = {
        host: process.env.PROXY_HOST,
        port: parseInt(process.env.PROXY_PORT, 10),
      };

      // Add proxy authentication if provided
      if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
        config.proxy.auth = {
          username: process.env.PROXY_USERNAME,
          password: process.env.PROXY_PASSWORD,
        };
      }

      // Support for proxy protocol (http/https)
      if (process.env.PROXY_PROTOCOL) {
        config.proxy.protocol = process.env.PROXY_PROTOCOL;
      }
    }

    return axios.create(config);
  }

  /**
   * Initialize session by making a GET request to the login page
   * @returns Promise with session initialization result
   */
  async initializeSession(): Promise<boolean> {
    try {
      const axiosInstance = this.createAxiosInstance();
      
      // First request to get initial cookies
      const initialResponse = await axiosInstance.get(this.loginUrl, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // Extract session cookies from first response
      const setCookieHeader = initialResponse.headers["set-cookie"];
      if (setCookieHeader) {
        setCookieHeader.forEach((cookie) => {
          if (cookie.includes("JSESSIONID=")) {
            this.sessionData.jsessionId = cookie.split("JSESSIONID=")[1].split(";")[0];
          }
          if (cookie.includes("GX_SESSION_ID=")) {
            this.sessionData.gxSessionId = cookie.split("GX_SESSION_ID=")[1].split(";")[0];
          }
        });
      }

      // Second request using the obtained cookies to get proper session state
      const sessionResponse = await axiosInstance.get(this.loginUrl, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "es-ES,es;q=0.9",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Dest": "document",
          Referer: "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpauglogin",
          Cookie: this.buildCookieHeader(),
        },
        timeout: 10000,
      });

      // Extract tokens from the second response HTML
      this.extractTokensFromHTML(sessionResponse.data);

      const cacheBuster = Date.now();
      const recoveryHash = this.sessionData.recoveryPageHash;
      const url = `${this.baseUrl}?${this.sessionData.recoveryPageHash},gx-no-cache=${cacheBuster}`;
      const newSession = await axiosInstance.get(url, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "es-ES,es;q=0.9",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Dest": "document",
          Referer: "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpauglogin",
        },
        timeout: 10000,
      });

      // Extract tokens from the second response HTML
      this.extractTokensFromHTML(newSession.data);

      this.sessionData.recoveryPageHash = recoveryHash;

      return !!(this.sessionData.jsessionId && this.sessionData.ajaxSecurityToken);
    } catch (error) {
      console.error("Failed to initialize SMI session:", error);
      return false;
    }
  }

  /**
   * Extract security tokens from HTML content
   * @param html - The HTML content from the login page
   */
  private extractTokensFromHTML(html: string): void {
    try {
      // Extract AJAX_SECURITY_TOKEN
      const ajaxTokenMatch = html.match(/"AJAX_SECURITY_TOKEN":"([^"]+)"/);
      if (ajaxTokenMatch) {
        this.sessionData.ajaxSecurityToken = ajaxTokenMatch[1];
      }

      // Extract GX_AUTH token
      const authTokenMatch = html.match(/"GX_AUTH_AUTOGESTION\.WPAUGRECUPERARPASSWORD":"([^"]+)"/);
      if (authTokenMatch) {
        this.sessionData.gxAuthToken = authTokenMatch[1];
      }

      // Extract GX_AJAX_KEY
      const ajaxKeyMatch = html.match(/"GX_AJAX_KEY":"([^"]+)"/);
      if (ajaxKeyMatch) {
        this.sessionData.gxAjaxKey = ajaxKeyMatch[1];
      }

      // Generate recovery page hash using session data
      this.sessionData.recoveryPageHash = this.generateRecoveryPageHash();
    } catch (error) {
      console.error("Failed to extract tokens from HTML:", error);
    }
  }

  /**
   * Generate recovery page hash based on GeneXus session and security patterns
   * @returns MD5 hash for the recovery page URL
   */
  private generateRecoveryPageHash(): string {
    try {
      // Based on GeneXus documentation and patterns observed in the JavaScript file,
      // the hash is typically generated from session data + object metadata + security tokens
      // GeneXus uses object-specific information for hash generation
      const recoveryObjectData = [
        "autogestion.wpaugrecuperarpassword", // Target object class
        "com.mgkwebfrontend", // Package name
        this.sessionData.jsessionId || "",
        this.sessionData.gxSessionId || "",
        this.sessionData.ajaxSecurityToken || "",
        // Add timestamp component for cache busting (similar to gx-no-cache parameter)
        Math.floor(Date.now() / 1000).toString(),
      ].join("|");

      // Generate MD5 hash as used by GeneXus framework
      const hash = crypto.createHash("md5").update(recoveryObjectData).digest("hex");

      return hash;
    } catch (error) {
      console.error("Failed to generate recovery page hash:", error);
      // Fallback to a default hash pattern if generation fails
      return "6cee17c9c6b0d3535d1e9001474b1f4c";
    }
  }

  /**
   * Generate login page hash for forgot password requests
   * @returns MD5 hash for the login page URL
   */
  private generateLoginPageHash(): string {
    try {
      // Generate hash specific to the login object
      const loginObjectData = [
        "autogestion.wpauglogin", // Login object class
        "com.mgkwebfrontend", // Package name
        this.sessionData.jsessionId || "",
        this.sessionData.gxSessionId || "",
        this.sessionData.ajaxSecurityToken || "",
        Math.floor(Date.now() / 1000).toString(),
      ].join("|");

      const hash = crypto.createHash("md5").update(loginObjectData).digest("hex");

      return hash;
    } catch (error) {
      console.error("Failed to generate login page hash:", error);
      // Fallback to a default hash pattern if generation fails
      return "303618c36883921c9a81d9b113d82232";
    }
  }

  /**
   * Execute forgot password action on login page
   * @returns Promise with success status
   */
  async executeForgotPassword(): Promise<boolean> {
    try {
      const axiosInstance = this.createAxiosInstance();
      const cacheBuster = Date.now();
      const hash = this.generateLoginPageHash(); // Use login page hash for forgot password action
      const url = `${this.loginUrl}?${hash},gx-no-cache=${cacheBuster}`;

      const payload = {
        MPage: false,
        cmpCtx: "",
        parms: [],
        hsh: [],
        objClass: "autogestion.wpauglogin",
        pkgName: "com.mgkwebfrontend",
        events: ["'FORGOTPASSWORD'"],
        grids: {},
      };

      const requestHeaders = {
        ...this.headers,
        Cookie: this.buildCookieHeader(),
        AJAX_SECURITY_TOKEN: this.sessionData.ajaxSecurityToken,
        "X-GXAUTH-TOKEN": this.sessionData.gxAuthToken,
      };

      const response: AxiosResponse<any> = await axiosInstance.post(url, payload, {
        headers: requestHeaders,
        timeout: 10000,
      });

      return response.status === 200;
    } catch (error) {
      console.error("Failed to execute forgot password:", error);
      return false;
    }
  }

  /**
   * Initialize recovery page by making a GET request
   * @returns Promise with initialization result
   */
  async initializeRecoveryPage(): Promise<boolean> {
    try {
      const axiosInstance = this.createAxiosInstance();
      const getHeaders = {
        Accept: "*/*",
        "Accept-Language": "es-ES,es;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "X-SPA-REQUEST": "1",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpauglogin",
        Cookie: this.buildCookieHeader(),
        AJAX_SECURITY_TOKEN: this.sessionData.ajaxSecurityToken,
      };

      const response = await axiosInstance.get(this.baseUrl, {
        headers: getHeaders,
        timeout: 10000,
      });

      return response.status === 200;
    } catch (error) {
      console.error("Failed to initialize recovery page:", error);
      return false;
    }
  }

  /**
   * Perform final validation request to validate account
   * @param finalUrl - The complete URL for the validation request
   * @returns Promise with validation result
   */
  async performFinalValidation(finalUrl: string): Promise<any> {
    try {
      const axiosInstance = this.createAxiosInstance();
      const cacheBuster = Date.now();
      const refererUrl = `${this.baseUrl}?${this.sessionData.recoveryPageHash},gx-no-cache=${cacheBuster}`;

      const validationHeaders = {
        Accept: "*/*",
        "Accept-Language": "es-ES,es;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Connection: "keep-alive",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "X-SPA-REQUEST": "1",
        "X-SPA-MP": "rwdnologueado",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: refererUrl,
        Cookie: this.buildCookieHeader(),
        AJAX_SECURITY_TOKEN: this.sessionData.ajaxSecurityToken,
      };

      const response = await axiosInstance.get(finalUrl, {
        headers: validationHeaders,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to perform final validation:", error);
      throw error;
    }
  }

  /**
   * Check if user is registered in SMI system
   * @param request - Object containing the CI
   * @returns Promise with SMI response data
   */
  async checkUser(request: SmiRequest): Promise<SmiResponse> {
    const startTime = Date.now();

    try {
      // Initialize session first
      const sessionInitialized = await this.initializeSession();
      if (!sessionInitialized) {
        return {
          success: false,
          hasUser: false,
          error: "No se pudo inicializar la sesión con SMI",
        };
      }

      // Generate unique cache buster
      const cacheBuster = Date.now();
      // Use the login page hash for the recovery request as shown in the example
      const url = `${this.baseUrl}?${this.sessionData.recoveryPageHash},gx-no-cache=${cacheBuster}`;

      const payload = {
        MPage: false,
        cmpCtx: "",
        parms: [false, request.ci.slice(0, -1), "", "", "", ""],
        hsh: [],
        objClass: "autogestion.wpaugrecuperarpassword",
        pkgName: "com.mgkwebfrontend",
        events: ["'CONFIRM'"],
        grids: {},
      };

      // Build headers with session data - match exact order and headers from example
      const requestHeaders = {
        Accept: "*/*",
        "Accept-Language": "es-ES,es;q=0.9",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        GxAjaxRequest: "1",
        Origin: "https://reservasweb.smi.com.uy",
        Pragma: "no-cache",
        Referer: "https://reservasweb.smi.com.uy/Autogestion/servlet/com.mgkwebfrontend.autogestion.wpaugrecuperarpassword",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Cookie: this.buildCookieHeader(),
        AJAX_SECURITY_TOKEN: this.sessionData.ajaxSecurityToken,
        "X-GXAUTH-TOKEN": this.sessionData.gxAuthToken,
      };
      const response: AxiosResponse<any> = await this.createAxiosInstance()
        .post(url, payload, {
          headers: requestHeaders,
          timeout: 10000, // 10 second timeout
        })
        .catch((e) => {
          return {
            data: e.response?.data || {},
            status: e.response?.status || 500,
          } as any;
        });

      // Check if we have a redirect command
      if (response.data && response.data.gxCommands && response.data.gxCommands[0] && response.data.gxCommands[0].redirect) {
        const toRedirect = response.data.gxCommands[0].redirect.url;

        const finalUrl = `https://reservasweb.smi.com.uy/Autogestion/servlet/${toRedirect}`;

        // Perform the final validation request
        const finalResponse = await this.performFinalValidation(finalUrl);

        return this.parseResponse(finalResponse, request.ci, Date.now() - startTime);
      } else {
        throw new Error("not_registered");
      }
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          return {
            success: false,
            hasUser: false,
            error: "Acceso denegado: API requiere autenticación válida",
          };
        } else if (error.response && error.response.status >= 500) {
          return {
            success: false,
            hasUser: false,
            error: "Error del servidor SMI",
          };
        }
      }

      return {
        success: error instanceof Error && error.message === "not_registered",
        hasUser: false,
        error: error instanceof Error ? error.message : "Error desconocido al consultar SMI",
      };
    }
  }

  /**
   * Build cookie header from session data
   * @returns Cookie header string
   */
  private buildCookieHeader(): string {
    const cookies = [];
    if (this.sessionData.jsessionId) {
      cookies.push(`JSESSIONID=${this.sessionData.jsessionId}`);
    }
    if (this.sessionData.gxSessionId) {
      cookies.push(`GX_SESSION_ID=${this.sessionData.gxSessionId}`);
    }
    // Add timezone cookie as seen in the original request
    cookies.push("GxTZOffset=America/Montevideo");
    return cookies.join("; ");
  }

  /**
   * Extract user data from the final HTML response
   * @param htmlContent - The HTML content from the final validation response
   * @returns Extracted user data
   */
  private extractUserDataFromHTML(htmlContent: string): ExtractedUserData {
    try {
      const $ = cheerio.load(htmlContent);

      // Check if this is the recovery page with user data
      const hasRecoveryContent = $('span:contains("Recuperar contraseña")').length > 0;

      if (!hasRecoveryContent) {
        return {
          isValidUser: false,
          mensaje: "No se encontró contenido de recuperación de contraseña",
        };
      }

      // Extract data from the script tag that contains gx.ajax.saveJsonResponse
      const scriptTags = $("script").toArray();
      let gxData: any = null;

      for (const script of scriptTags) {
        const scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes("gx.ajax.saveJsonResponse")) {
          try {
            // Find the start of the object after gx.ajax.saveJsonResponse(
            const startIndex = scriptContent.indexOf("gx.ajax.saveJsonResponse(") + "gx.ajax.saveJsonResponse(".length;
            if (startIndex > "gx.ajax.saveJsonResponse(".length - 1) {
              // Find the matching closing parenthesis by counting braces
              let braceCount = 0;
              let inString = false;
              let escapeNext = false;
              let endIndex = -1;

              for (let i = startIndex; i < scriptContent.length; i++) {
                const char = scriptContent[i];

                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }

                if (char === "\\") {
                  escapeNext = true;
                  continue;
                }

                if (char === '"' || char === "'") {
                  if (!escapeNext) {
                    inString = !inString;
                  }
                  continue;
                }

                if (!inString) {
                  if (char === "{") {
                    braceCount++;
                  } else if (char === "}") {
                    braceCount--;
                    if (braceCount === 0) {
                      endIndex = i;
                      break;
                    }
                  }
                }
              }

              if (endIndex > startIndex) {
                const jsObjectString = scriptContent.substring(startIndex, endIndex + 1);

                // Convert JavaScript object notation to JSON by using eval in a safe context
                // This is necessary because GeneXus generates JavaScript objects, not JSON
                const safeEval = new Function("return " + jsObjectString);
                gxData = safeEval();
                break;
              }
            }
          } catch (parseError) {
            console.error("Error parsing GeneXus data:", parseError);
          }
        }
      }

      // Extract user data from the gxHiddens object
      const userData: ExtractedUserData = {
        isValidUser: false,
      };

      if (gxData && gxData.gxHiddens) {
        const hiddens = gxData.gxHiddens;

        // Extract user ID and CI
        userData.perID = hiddens.vPERID;
        userData.perCI = hiddens.vPERCI;

        // Extract masked email and phone
        userData.perMail = hiddens.vPERMAIL;
        userData.domicTel = hiddens.vDOMICTEL;

        // Extract recovery type
        userData.tipoCodigoRecuperacion = hiddens.vTIPOCODIGO;

        // Extract available recovery methods
        if (hiddens.vMETODOS && Array.isArray(hiddens.vMETODOS)) {
          userData.metodos = hiddens.vMETODOS.map((metodo: any) => ({
            tipo: metodo.Tipo,
            descripcion: metodo.Descripcion,
          }));
        }

        // User is valid if we have both ID and CI
        userData.isValidUser = !!(userData.perID && userData.perCI);
      }

      // Check for selection dropdown which indicates successful user validation
      const hasMethodSelection = $("#vMETODOENVIO").length > 0;
      if (hasMethodSelection && userData.perID) {
        userData.isValidUser = true;
      }

      return userData;
    } catch (error) {
      console.error("Error extracting user data from HTML:", error);
      return {
        isValidUser: false,
        mensaje: "Error al procesar la respuesta HTML",
      };
    }
  }
  /**
   * Parse the raw API response into our standardized format
   * @param apiResponse - Raw response from SMI API
   * @param ci - The CI number that was queried
   * @param executionTime - Time taken for the request
   * @returns Parsed SmiResponse
   */
  private parseResponse(apiResponse: any, ci: string, executionTime: number): SmiResponse {
    try {
      // Handle HTML response (form response)
      if (typeof apiResponse === "string" && apiResponse.includes("<html")) {
        // Use the new extraction function for HTML content
        const userData = this.extractUserDataFromHTML(apiResponse);

        if (userData.isValidUser) {
          return {
            success: true,
            hasUser: true,
            member: {
              userData,
              ci,
              status: "registered",
              executionTime,
            },
          };
        } else {
          return {
            success: true,
            hasUser: false,
            error: userData.mensaje || "Usuario no registrado en SMI",
          };
        }
      }

      // Handle JSON response from GeneXus
      if (typeof apiResponse === "object") {
        // Check for success indicators in GeneXus response
        if (apiResponse.vISOK === true || apiResponse.vSUCCESS === true) {
          return {
            success: true,
            hasUser: true,
            member: {
              ci,
              status: "registered",
              executionTime,
            },
          };
        }

        // Check for messages indicating user status
        if (apiResponse.vMSG || apiResponse.messages) {
          const message = (apiResponse.vMSG || (apiResponse.messages && apiResponse.messages[0]?.text) || "").toLowerCase();
          if (message.includes("no encontrado") || message.includes("no existe") || message.includes("inválido") || message.includes("no registrado")) {
            return {
              success: true,
              hasUser: false,
              error: "Usuario no registrado en SMI",
            };
          } else if (message.includes("encontrado") || message.includes("existe") || message.includes("válido")) {
            return {
              success: true,
              hasUser: true,
              member: {
                ci,
                status: "registered",
                executionTime,
              },
            };
          }
        }

        // Check for variables in GeneXus response that might indicate user status
        if (apiResponse.variables) {
          const vars = apiResponse.variables;
          if (vars.vUSERFOUND === true || vars.vEXISTS === true) {
            return {
              success: true,
              hasUser: true,
              member: {
                ci,
                status: "registered",
                executionTime,
              },
            };
          }
        }
      }

      // Default case - assume not found if we can't determine status
      return {
        success: true,
        hasUser: false,
        error: "No se pudo determinar el estado del usuario en SMI",
      };
    } catch (parseError) {
      return {
        success: false,
        hasUser: false,
        error: "Error al procesar la respuesta de SMI",
      };
    }
  }

  /**
   * Check if user exists in the SMI system
   * @param request - Object containing the CI
   * @returns Promise with boolean indicating if user exists
   */
  async hasUser(request: SmiRequest): Promise<boolean> {
    const response = await this.checkUser(request);
    return response.hasUser;
  }

  /**
   * Get member information
   * @param request - Object containing the CI
   * @returns Promise with member data or null if not found
   */
  async getMember(request: SmiRequest): Promise<SmiMember | null> {
    const response = await this.checkUser(request);
    return response.member || null;
  }

  /**
   * Extract detailed user data from HTML response
   * @param htmlContent - HTML content from SMI response
   * @returns Extracted user data with detailed information
   */
  extractUserData(htmlContent: string): ExtractedUserData {
    return this.extractUserDataFromHTML(htmlContent);
  }
}
