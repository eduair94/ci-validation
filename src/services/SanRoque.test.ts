import { SanRoqueService } from '../services/SanRoque';

/**
 * Test script for SanRoque service
 * Tests the functionality of checking members in the San Roque system
 */

async function testSanRoqueService() {
  const sanRoqueService = new SanRoqueService();
  
  console.log('🧪 Testing San Roque Service...\n');

  // Test cases
  const testCases = [
    { ci: '47073450', description: 'CI from original curl example' },
    { ci: '19119365', description: 'Known valid CI format' },
    { ci: '99999999', description: 'Test CI (should exist based on curl test)' },
    { ci: '12345678', description: 'Valid format CI (8 digits)' },
    { ci: '123', description: 'Invalid CI (too short)' },
    { ci: '123456789', description: 'Invalid CI (too long)' },
    { ci: '', description: 'Empty CI' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.description}`);
    console.log(`   CI: ${testCase.ci}`);
    console.log('   ─'.repeat(50));

    try {
      const startTime = Date.now();
      const result = await sanRoqueService.checkMember({ ci: testCase.ci });
      const endTime = Date.now();

      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   👤 Has User: ${result.hasUser}`);
      console.log(`   ⏱️  Execution Time: ${endTime - startTime}ms`);
      
      if (result.member) {
        console.log(`   📊 Member Info:`);
        console.log(`      - CI: ${result.member.ci}`);
        console.log(`      - Document Type: ${result.member.documentType}`);
        console.log(`      - Name: ${result.member.firstName} ${result.member.lastName}`);
        console.log(`      - Email: ${result.member.email}`);
        console.log(`      - Status: ${result.member.status}`);
      }
      
      if (result.points) {
        console.log(`   💰 Points Info:`);
        console.log(`      - Available: ${result.points.available}`);
        console.log(`      - Expiring 30 days: ${result.points.expiring30Days}`);
        console.log(`      - Total: ${result.points.total}`);
      }
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }

    } catch (error) {
      console.log(`   💥 Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test convenience methods
  console.log('\n\n🚀 Testing convenience methods...\n');
  
  try {
    console.log('📞 Testing isMember method:');
    const isMember = await sanRoqueService.isMember('47073450');
    console.log(`   Result: ${isMember}`);

    console.log('\n💰 Testing getMemberPoints method:');
    const points = await sanRoqueService.getMemberPoints('47073450');
    console.log(`   Points: ${points}`);

    console.log('\n🏆 Testing getTotalMemberPoints method:');
    const totalPoints = await sanRoqueService.getTotalMemberPoints('47073450');
    console.log(`   Total Points: ${totalPoints}`);

    console.log('\n📄 Testing getMemberInfo method:');
    const memberInfo = await sanRoqueService.getMemberInfo('47073450');
    console.log(`   Success: ${memberInfo.success}`);
    console.log(`   Has User: ${memberInfo.hasUser}`);
    console.log(`   Member Name: ${memberInfo.member?.firstName} ${memberInfo.member?.lastName}`);

  } catch (error) {
    console.log(`   💥 Exception in convenience methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n✨ San Roque Service testing completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSanRoqueService().catch(console.error);
}

export { testSanRoqueService };
