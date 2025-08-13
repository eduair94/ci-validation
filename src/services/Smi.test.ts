import { SmiService } from "./Smi";

async function testSmiService() {
  const service = new SmiService();

  console.log("Testing SMI Service");
  console.log("=".repeat(50));

  // Test cases with different CI numbers
  const testCases = [
    { ci: "51356959", description: "Eduardo CI" },
    { ci: "12345678", description: "Test CI 1" },
    { ci: "99999999", description: "Test CI 2" },
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.description}: ${testCase.ci}`);
    console.log("-".repeat(40));

    try {
      // Test full checkUser response
      const userResult = await service.checkUser({ ci: testCase.ci });
      console.log("Full Response:", JSON.stringify(userResult, null, 2));
      process.exit(1);
      // Test convenience methods
      //   const hasUser = await service.hasUser({ ci: testCase.ci });
      //   console.log('Has User:', hasUser);

      //   const member = await service.getMember({ ci: testCase.ci });
      //   console.log('Member:', member);
    } catch (error) {
      console.error("Error testing CI:", testCase.ci, error);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Note: SMI API requires authentication and session management.");
  console.log('Results may show "not registered" due to auth requirements.');
  console.log("In production, proper session handling would be needed.");
}

testSmiService();
