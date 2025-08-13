import axios from "axios";

interface FarmashopResponse {
  statusCode: number;
  responseContent: ResponseContent;
  internalErrorMessage: null;
  internalRequestInfo: null;
  isFarmashopAPIError: boolean;
  isSuccessfulStatusCode: boolean;
}

interface ResponseContent {
  valid: boolean;
  message: string;
  options: Option[];
}

interface Option {
  type: string;
  value: string;
  checksums: string;
}

class Farmashop {
  private endpoint = "https://api-app.farmashop.com.uy/api/v3/User/GetPasswordRecoveryOptions";
  headers = {
    "Accept-Encoding": "gzip",
    AppRequestStackTrace: "-",
    AppVersion: "7.1.3",
    Authorization: "K3wCIM5EsvyxVcuQUOiYuoGqFuKhv/wuyqY+BMNnsu4=",
    BuildConfiguration: "RELEASE",
    ChannelName: "PRODUCTION",
    Connection: "Keep-Alive",
    DeviceManufacturer: "un celular chafa",
    DeviceModel: "SM :(",
    DeviceOS: "Android",
    DeviceOSVersion: "12",
    Host: "api-app.farmashop.com.uy",
    SessionId: "hola n-n",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12; SM-G988N Build/NRD90M)",
  };

  constructor(private ci: string) {}

  async getPoints(): Promise<FarmashopResponse> {
    try {
      const response = await axios.get(`${this.endpoint}/${this.ci}`, { headers: this.headers }).catch((e) => {
        console.error("Error fetching Farmashop points:", e);
        return {
          data: {
            error: e.message,
          },
        };
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Farmashop points:", error);
      throw error;
    }
  }
}

export default Farmashop;
