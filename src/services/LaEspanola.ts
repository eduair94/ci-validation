import axios, { AxiosResponse } from "axios";
import * as crypto from "crypto";

// Interface for La Española request parameters
export interface LaEspanolaRequest {
  ci: string;
}

// Interface for extracted user data from La Española response
export interface LaEspanolaUserData {
  isValidUser: boolean;
  userCode?: string;
  userUUID?: string;
  firstName?: string;
  lastName?: string;
  matricula?: number;
  aeId?: number;
  tipoDocumento?: number;
  paisCodigo?: number;
  documento?: string;
  mensaje?: string;
}

// Interface for La Española service response
export interface LaEspanolaResponse {
  success: boolean;
  hasUser: boolean;
  member?: {
    userData: LaEspanolaUserData;
    ci: string;
    status: "registered" | "not_found" | "invalid";
    executionTime: number;
  };
  error?: string;
}

// Interface for session data
interface SessionData {
  jsessionId?: string;
  gxSessionId?: string;
  ajaxSecurityToken?: string;
  gxAuthToken?: string;
  cookies: string;
}

/**
 * Service for checking user existence in La Española (ASESP) system
 * Uses the autogestion portal API to verify CI registration
 */
export class LaEspanolaService {
  private baseUrl = "https://autogestion.asesp.com.uy";
  private timeout = 30000; // 30 seconds
  private sessionData: SessionData = { cookies: "" };

  /**
   * Initialize session by getting the homepage and extracting necessary tokens
   * @returns Session data with cookies and tokens
   */
  private async initializeSession(): Promise<any> {
    try {
      console.log("🔍 Initializing La Española session...");

      // First, get the login page to establish session
      const loginPageUrl = `${this.baseUrl}/Autogestion/`;
      let initialResponse = await axios.get(loginPageUrl, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
        },
      });

      console.log(`📡 Initial response status: ${initialResponse.status}`);
      console.log(`📄 Response headers:`, initialResponse.headers);

      // Extract cookies from response headers
      const cookies = this.extractCookiesFromResponse(initialResponse);
      console.log(`🍪 Extracted cookies:`, cookies);

      // Store cookies in session
      this.sessionData.cookies = this.formatCookiesString(cookies);

      // Extract tokens from HTML content

      initialResponse = await axios.get(loginPageUrl, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers: {
          Cookie: this.sessionData.cookies,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
        },
      });

      const tokens = this.extractTokensFromHTML(initialResponse.data);
      console.log(`🔑 Extracted tokens:`, tokens);

      // Update session data with tokens
      this.sessionData.ajaxSecurityToken = tokens.ajaxSecurityToken;
      this.sessionData.gxAuthToken = tokens.gxAuthToken;

      console.log("✅ Session initialized successfully");
      console.log(`📋 Session summary:`);
      console.log(`   Cookies: ${this.sessionData.cookies}`);
      console.log(`   AJAX_SECURITY_TOKEN: ${this.sessionData.ajaxSecurityToken}`);
      console.log(`   X-GXAUTH-TOKEN: ${this.sessionData.gxAuthToken}`);

      return true;
    } catch (error) {
      console.error("❌ Error initializing session:", error);
      throw new Error("No se pudo inicializar la sesión con La Española");
    }
  }

  /**
   * Extract cookies from HTTP response headers
   * @param response - Axios response object
   * @returns Object containing extracted cookies
   */
  private extractCookiesFromResponse(response: AxiosResponse): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (response.headers["set-cookie"]) {
      response.headers["set-cookie"].forEach((cookie: string) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) {
          cookies[name.trim()] = value.trim();
        }
      });
    }

    return cookies;
  }

  /**
   * Format cookies object into a cookie string for HTTP headers
   * @param cookies - Object containing cookie name-value pairs
   * @returns Formatted cookie string
   */
  private formatCookiesString(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /**
   * Extract authentication tokens from HTML response
   * @param htmlContent - HTML content from the response
   * @returns Object with extracted tokens
   */
  private extractTokensFromHTML(htmlContent: string): Record<string, string> {
    try {
      // Extract AJAX_SECURITY_TOKEN
      const ajaxTokenMatch = htmlContent.match(/AJAX_SECURITY_TOKEN['"]\s*:\s*['"]([^'"]+)['"]/);
      if (ajaxTokenMatch) {
        this.sessionData.ajaxSecurityToken = ajaxTokenMatch[1];
      }

      // Extract X-GXAUTH-TOKEN
      const gxAuthTokenMatch = htmlContent.match(/X-GXAUTH-TOKEN['"]\s*:\s*['"]([^'"]+)['"]/);
      if (gxAuthTokenMatch) {
        this.sessionData.gxAuthToken = gxAuthTokenMatch[1];
      }

      // If tokens not found in HTML, use sample tokens (they might be generated dynamically)
      if (!this.sessionData.ajaxSecurityToken) {
        this.sessionData.ajaxSecurityToken = this.generateSecurityToken();
      }
      if (!this.sessionData.gxAuthToken) {
        this.sessionData.gxAuthToken = this.generateAuthToken();
      }

      return {
        ajaxSecurityToken: this.sessionData.ajaxSecurityToken,
        gxAuthToken: this.sessionData.gxAuthToken,
      };
    } catch (error) {
      console.error("Error extracting tokens from HTML:", error);

      return {
        ajaxSecurityToken: "",
        gxAuthToken: "",
      };
    }
  }

  /**
   * Generate a security token similar to the format used by La Española
   * @returns Generated security token
   */
  private generateSecurityToken(): string {
    const timestamp = Date.now().toString();
    const randomData = Math.random().toString(36).substring(2);
    const combined = timestamp + randomData;
    return crypto.createHash("md5").update(combined).digest("hex");
  }

  /**
   * Generate an auth token similar to the format used by La Española
   * @returns Generated auth token
   */
  private generateAuthToken(): string {
    const timestamp = Date.now().toString(16);
    return timestamp.substring(0, 8);
  }

  /**
   * Generate URL hash parameter based on session and timestamp
   * @returns Generated hash parameter
   */
  private generateUrlHash(): string {
    const timestamp = Date.now();
    // Use a simpler hash generation approach similar to the working curl example
    const baseString = `${this.sessionData.ajaxSecurityToken}${timestamp}`;
    const hash = crypto.createHash("md5").update(baseString).digest("hex");
    return `${hash.substring(0, 8)},gx-no-cache=${timestamp}`;
  }

  /**
   * Check if a user exists in La Española system
   * @param request - Request containing CI to check
   * @returns Promise with user verification result
   */
  async checkUser(request: LaEspanolaRequest): Promise<LaEspanolaResponse> {
    const startTime = Date.now();

    try {
      // Initialize session if needed
      if (!this.sessionData.cookies) {
        const sessionInitialized = await this.initializeSession();
        if (!sessionInitialized) {
          return {
            success: false,
            hasUser: false,
            error: "Failed to initialize session with La Española",
          };
        }
      }

      // Prepare the request payload
      const payload = {
        MPage: false,
        cmpCtx: "",
        parms: [request.ci, false, "", "", "", "IdentityProvider.GAMRemoteLogin", { Success: false }, 6],
        hsh: ["80ba4750"],
        objClass: "identityprovider.gamremotelogin",
        pkgName: "uy.com.asesp",
        events: ["ENTER"],
        grids: {},
      };

      // Generate URL hash
      const urlHash = this.generateUrlHash();
      const requestUrl = `${this.baseUrl}/Autogestion/?${urlHash}`;

      console.log("Making La Española request to:", requestUrl);
      console.log("Request payload:", JSON.stringify(payload, null, 2));

      // Make the API request
      const response = await axios.post(requestUrl, payload, {
        headers: {
          AJAX_SECURITY_TOKEN: this.sessionData.ajaxSecurityToken!,
          Accept: "*/*",
          "Accept-Language": "es-ES,es;q=0.9,bg;q=0.8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Content-Type": "application/json",
          Cookie: this.sessionData.cookies,
          GxAjaxRequest: "1",
          Origin: "https://autogestion.asesp.com.uy",
          Pragma: "no-cache",
          Referer: "https://autogestion.asesp.com.uy/Autogestion/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "X-GXAUTH-TOKEN": this.sessionData.gxAuthToken!,
          "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
        },
        timeout: 30000,
      });

      const executionTime = Date.now() - startTime;
      console.log("La Española response status:", response.status);

      return this.parseResponse(response.data, request.ci, executionTime);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      if (error.response) {
        console.error("Error response status:", error.response.status);

        if (error.response.status === 401 || error.response.status === 403) {
          return {
            success: false,
            hasUser: false,
            error: "Acceso denegado: API requiere autenticación válida",
          };
        } else if (error.response.status >= 500) {
          return {
            success: false,
            hasUser: false,
            error: "Error del servidor La Española",
          };
        }
      }

      return {
        success: false,
        hasUser: false,
        error: error instanceof Error ? error.message : "Error desconocido al consultar La Española",
      };
    }
  }

  /**
   * Parse the raw API response into our standardized format
   * @param apiResponse - Raw response from La Española API
   * @param ci - The CI number that was queried
   * @param executionTime - Time taken for the request
   * @returns Parsed LaEspanolaResponse
   */
  private parseResponse(apiResponse: any, ci: string, executionTime: number): LaEspanolaResponse {
    try {
      // Check if response contains user data
      if (apiResponse.gxValues && Array.isArray(apiResponse.gxValues) && apiResponse.gxValues.length > 0) {
        const userData = apiResponse.gxValues[0];

        // Check for successful authentication or user found
        if (userData.AV117K2BContext && (userData.AV117K2BContext.UserCode || userData.AV117K2BContext.UserUUID || userData.AV117K2BContext.UsuarioDocumento)) {
          const k2bContext = userData.AV117K2BContext;
          const extractedUserData: LaEspanolaUserData = {
            isValidUser: true,
            userCode: k2bContext.UserCode || undefined,
            userUUID: k2bContext.UserUUID || undefined,
            firstName: k2bContext.UserFirstName || undefined,
            lastName: k2bContext.UserLastName || undefined,
            matricula: k2bContext.UsuarioMatricula || undefined,
            aeId: k2bContext.UsuarioAEId || undefined,
            tipoDocumento: k2bContext.UsuarioTipoDocumentoCodigo || undefined,
            paisCodigo: k2bContext.UsuarioPaisCodigo || undefined,
            documento: k2bContext.UsuarioDocumento || undefined,
          };

          return {
            success: true,
            hasUser: true,
            member: {
              userData: extractedUserData,
              ci,
              status: "registered",
              executionTime,
            },
          };
        }
      }

      // Check for error messages
      if (apiResponse.gxMessages && apiResponse.gxMessages.MAIN && Array.isArray(apiResponse.gxMessages.MAIN)) {
        const messages = apiResponse.gxMessages.MAIN;
        for (const message of messages) {
          if (message.text) {
            const messageText = message.text.toLowerCase();

            // Common error messages indicating user not found
            if (messageText.includes("usuario o contraseña incorrecta") || messageText.includes("no encontrado") || messageText.includes("no existe") || messageText.includes("inválido") || messageText.includes("no registrado")) {
              return {
                success: true,
                hasUser: false,
                error: message.text,
              };
            }
          }
        }
      }

      // Check for result SDT errors
      if (apiResponse.gxValues && apiResponse.gxValues[0] && apiResponse.gxValues[0].AV93ResultadoSDT) {
        const resultado = apiResponse.gxValues[0].AV93ResultadoSDT;
        if (!resultado.Success && resultado.Detalle) {
          // Check if error indicates user not found vs authentication error
          const descripcion = resultado.Detalle.Descripcion || "";
          if (descripcion.includes("Usuario o contraseña incorrecta")) {
            return {
              success: true,
              hasUser: false,
              error: "no_user",
            };
          }
          return {
            success: false,
            hasUser: false,
            error: descripcion,
          };
        }
      }

      // Check for CAPTCHA requirement
      if (apiResponse.gxProps && Array.isArray(apiResponse.gxProps) && apiResponse.gxProps.length > 0) {
        const props = apiResponse.gxProps[0];
        if (props.vCAPTCHAIMAGE && props.vCAPTCHAIMAGE.Visible === "1") {
          return {
            success: false,
            hasUser: false,
            error: "CAPTCHA requerido para continuar",
          };
        }
      }

      // Default case - could not determine user status
      return {
        success: true,
        hasUser: false,
        error: "no_user",
      };
    } catch (parseError) {
      console.error("Error parsing La Española response:", parseError);
      return {
        success: false,
        hasUser: false,
        error: "Error al procesar la respuesta de La Española",
      };
    }
  }

  /**
   * Check if the service is available
   * @returns Promise indicating service availability
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/Autogestion/`, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error("La Española service availability check failed:", error);
      return false;
    }
  }
}

export default LaEspanolaService;
