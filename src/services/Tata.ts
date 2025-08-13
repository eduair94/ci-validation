import axios from "axios";

export interface TataRes {
  id: string;
  contactData: string;
  type: string;
  isDefault: boolean;
}

class Tata {
  endpoint = `https://api.plus.uy/public/member/contact/reset?documentNumber=<DOCUMENT>&documentType=C&type=RESET_PASSWORD`;
  headers = {
    accept: "application/json, text/plain, */*",
    referer: "https://plus.uy/",
    "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "x-country-code": "UY",
    "x-loyalty-program-id": "PLUS",
    "x-version": "3.1.151",
  };

  constructor(private ci: string) {}

  async getPoints(): Promise<TataRes> {
    try {
      const response = await axios.get(`${this.endpoint.replace("<DOCUMENT>", this.ci)}`, { headers: this.headers }).catch((e) => {
        return {
          data: {
            ...e.response.data,
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

export default Tata;
