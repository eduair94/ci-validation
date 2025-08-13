import { ExternalCiService } from './ExternalCiService';

async function testWithPoints() {
  const service = new ExternalCiService();
  console.log('Testing ExternalCiService with CI that has San Roque points: 99999999');
  console.log('='.repeat(60));
  
  const result = await service.getUserFriendlyInfo('99999999');
  console.log('Result:', JSON.stringify(result, null, 2));
  
  // Check if San Roque service shows points
  const sanRoqueService = result.data.persona.services.find(s => s.service === 'San Roque');
  if (sanRoqueService) {
    console.log('\nSan Roque service details:');
    console.log(`- Status: ${sanRoqueService.status}`);
    console.log(`- Points: ${sanRoqueService.points}`);
    console.log(`- Message: ${sanRoqueService.message}`);
  }
}

testWithPoints();
