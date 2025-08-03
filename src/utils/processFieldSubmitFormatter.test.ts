import { ProcessFieldSubmitFormatter } from "../utils/processFieldSubmitFormatter";

describe("ProcessFieldSubmitFormatter", () => {
  test("should create a clean request object", () => {
    const result = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");

    expect(result).toEqual({
      frmId: "6687",
      attId: "12295",
      value: "1",
    });

    // Verificar el orden de las propiedades
    const keys = Object.keys(result);
    expect(keys).toEqual(["frmId", "attId", "value"]);
  });

  test("should remove duplicates and sort multiple requests", () => {
    const requests = [
      { frmId: "6368", attId: "1929", value: "" },
      { frmId: "6687", attId: "12295", value: "1" },
      { frmId: "6368", attId: "1569", value: "1" },
      { frmId: "6687", attId: "12295", value: "1" }, // Duplicado
      { frmId: "6368", attId: "1239", value: "test" },
    ];

    const result = ProcessFieldSubmitFormatter.createMultipleRequests(requests);

    // No debe haber duplicados
    expect(result.length).toBe(4);

    // Debe estar ordenado por frmId, luego por attId
    expect(result[0].frmId).toBe("6368");
    expect(result[0].attId).toBe("1239");
    expect(result[1].frmId).toBe("6368");
    expect(result[1].attId).toBe("1569");
    expect(result[2].frmId).toBe("6368");
    expect(result[2].attId).toBe("1929");
    expect(result[3].frmId).toBe("6687");
    expect(result[3].attId).toBe("12295");
  });

  test("should extract parameters from URL", () => {
    const url = "https://www.tramitesenlinea.mef.gub.uy/Apia/apia.execution.FormAction.run?action=processFieldSubmit&isAjax=true&react=true&tabId=1754182283786&tokenId=1754182283743&timestamp=1754182367411&attId=1929&frmId=6368&index=0&frmParent=E&timestamp=1754182367410";

    const result = ProcessFieldSubmitFormatter.extractFromUrl(url);

    expect(result).toEqual({
      frmId: "6368",
      attId: "1929",
      value: "",
    });
  });

  test("should validate request structure", () => {
    const validRequest = { frmId: "6687", attId: "12295", value: "1" };
    const invalidRequest1 = { frmId: "6687", attId: "12295" }; // Falta value
    const invalidRequest2 = { frmId: "6687", attId: "12295", value: "1", extra: "field" }; // Campo extra

    expect(ProcessFieldSubmitFormatter.isValidRequest(validRequest)).toBe(true);
    expect(ProcessFieldSubmitFormatter.isValidRequest(invalidRequest1)).toBe(false);
    expect(ProcessFieldSubmitFormatter.isValidRequest(invalidRequest2)).toBe(false);
  });

  test("should generate formatted JSON string", () => {
    const request = ProcessFieldSubmitFormatter.createRequest("6687", "12295", "1");
    const jsonString = ProcessFieldSubmitFormatter.toFormattedJson(request);

    expect(jsonString).toContain('"frmId": "6687"');
    expect(jsonString).toContain('"attId": "12295"');
    expect(jsonString).toContain('"value": "1"');

    // Verificar que el JSON es parseable
    const parsed = JSON.parse(jsonString);
    expect(parsed).toEqual(request);
  });

  test("should handle empty values correctly", () => {
    const requests = [
      { frmId: "6368", attId: "1929", value: "" },
      { frmId: "6368", attId: "1929", value: "updated" }, // Debe reemplazar el valor vacío
    ];

    const result = ProcessFieldSubmitFormatter.createMultipleRequests(requests);

    expect(result.length).toBe(1);
    expect(result[0].value).toBe("updated");
  });

  test("should trim whitespace from inputs", () => {
    const result = ProcessFieldSubmitFormatter.createRequest("  6687  ", "  12295  ", "  1  ");

    expect(result).toEqual({
      frmId: "6687",
      attId: "12295",
      value: "1",
    });
  });
});
