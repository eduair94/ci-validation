// Test script to verify SMI_PROXY functionality
import dotenv from "dotenv";
import { SmiService } from "./services/Smi";

// Load environment variables
dotenv.config();

async function testSmiProxy() {
  console.log("🔧 Testing SMI Proxy Configuration");
  console.log("=================================");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("- SMI_PROXY:", process.env.SMI_PROXY || "Not set (will use direct connection)");
  console.log("- PROXY:", process.env.PROXY || "Not set");
  console.log("");

  const smiService = new SmiService();

  try {
    console.log("⏳ Testing SMI service...");

    // Test with a sample CI
    const testCi = "14115499";
    console.log(`Testing CI: ${testCi}`);

    const startTime = Date.now();
    const result = await smiService.checkUser({ ci: testCi });
    const duration = Date.now() - startTime;

    console.log("✅ SMI service test completed");
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log("Result:", JSON.stringify(result, null, 2));

    if (process.env.SMI_PROXY) {
      console.log(`🔄 Used proxy: ${process.env.SMI_PROXY}`);
    } else {
      console.log("🔗 Used direct connection to SMI");
    }
  } catch (error) {
    console.log("❌ SMI service test failed");
    console.error("Error:", error);
  }
}

// Test specific proxy
async function testSpecificProxy(proxyUrl: string) {
  console.log(`\n🧪 Testing specific proxy: ${proxyUrl}`);
  console.log("==========================================");

  // Temporarily set the proxy
  const originalProxy = process.env.SMI_PROXY;
  process.env.SMI_PROXY = proxyUrl;

  try {
    await testSmiProxy();
  } finally {
    // Restore original proxy
    if (originalProxy) {
      process.env.SMI_PROXY = originalProxy;
    } else {
      delete process.env.SMI_PROXY;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  (async () => {
    try {
      // Test current configuration
      await testSmiProxy();

      console.log("\n🎉 SMI proxy tests completed");
      process.exit(0);
    } catch (error) {
      console.error("\n💥 SMI proxy tests failed:", error);
      process.exit(1);
    }
  })();
}

export { testSmiProxy, testSpecificProxy };
