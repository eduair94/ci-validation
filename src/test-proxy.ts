// Test script to verify proxy configuration
import dotenv from "dotenv";
import { SmiService } from "./services/Smi";

// Load environment variables
dotenv.config();

async function testProxyConfiguration() {
  console.log("🔧 Testing Proxy Configuration");
  console.log("==============================");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("- PROXY:", process.env.PROXY || "Not set");
  console.log("- PROXY_HOST:", process.env.PROXY_HOST || "Not set");
  console.log("- PROXY_PORT:", process.env.PROXY_PORT || "Not set");
  console.log("");

  const smiService = new SmiService();

  try {
    console.log("⏳ Testing SMI service with proxy configuration...");

    // Test with a known valid CI
    const result = await smiService.checkUser({ ci: "12345678" });

    console.log("✅ SMI service test completed");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("❌ SMI service test failed");
    console.error("Error:", error);
  }
}

// Run test if called directly
if (require.main === module) {
  testProxyConfiguration()
    .then(() => {
      console.log("\n🎉 Proxy test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Proxy test failed:", error);
      process.exit(1);
    });
}

export { testProxyConfiguration };
