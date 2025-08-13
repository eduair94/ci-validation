import axios from "axios";

export type ResPuntosMas =
  | {
      Total: number;
      MAS: number;
    }
  | { error: string };

class PuntosMas {
  endpoint = "https://gduavailability.herokuapp.com/get-points";
  constructor(private ci: string) {}

  /**
   * Extracts JSON object from a string that contains JSON data
   * @param str - String containing JSON data like: ({"Total":2,"HIPERCARD":2})
   * @returns Parsed JSON object or null if extraction fails
   */
  extractJsonFromString(str: string): any | null {
    try {
      // Remove parentheses and any leading/trailing whitespace
      const cleanedStr = str.replace(/^\(|\)$/g, "").trim();

      // Parse the JSON string
      return JSON.parse(cleanedStr);
    } catch (error) {
      console.error("Error extracting JSON from string:", error);
      return null;
    }
  }

  async getPoints(): Promise<any> {
    try {
      const response = await axios.get(`${this.endpoint}/${this.ci}`).catch((e) => {
        console.error("Error fetching points:", e);
        return { data: { error: e.message } };
      });
      if (typeof response.data === "string") {
        // Use the extractJsonFromString method to parse string responses
        const extractedData = this.extractJsonFromString(response.data);
        if (extractedData) {
          return extractedData as ResPuntosMas;
        }
      }
      return response.data as ResPuntosMas;
    } catch (error) {
      console.error("Error fetching points:", error);
      throw error;
    }
  }
}

export default PuntosMas;
