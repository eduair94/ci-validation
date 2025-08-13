import LaEspanola from "./src/services/LaEspanola";

async function testLaEspanola() {
  console.log("🧪 Testing La Española service with enhanced session handling...");

  const service = new LaEspanola();

  // Test if service is available
  console.log("🔍 Checking service availability...");
  const isAvailable = await service.isServiceAvailable();
  console.log(`📡 Service available: ${isAvailable}`);

  if (isAvailable) {
    // Test with a valid CI number
    console.log("📋 Testing with CI: 12345678...");
    const result = await service.checkUser({ ci: "12345678" });

    console.log("✅ Test Result:");
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("❌ Service is not available, skipping CI test");
  }
}

testLaEspanola().catch(console.error);
