import { ExternalCiService } from './ExternalCiService';

async function testExternalCiService() {
  const service = new ExternalCiService();
  
  console.log('Testing ExternalCiService with CI: 47073450');
  console.log('='.repeat(50));
  
  try {
    // Test raw query
    console.log('\n1. Testing raw queryCiInfo:');
    const rawResult = await service.queryCiInfo('47073450');
    console.log('Raw result:', JSON.stringify(rawResult, null, 2));
    
    // Test user-friendly format
    console.log('\n2. Testing getUserFriendlyInfo:');
    const friendlyResult = await service.getUserFriendlyInfo('47073450');
    console.log('Friendly result:', JSON.stringify(friendlyResult, null, 2));
    
    // Test with a CI that should not exist in some services
    console.log('\n3. Testing with CI that may not exist everywhere: 12345678');
    const testResult = await service.getUserFriendlyInfo('12345678');
    console.log('Test result:', JSON.stringify(testResult, null, 2));
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testExternalCiService();
