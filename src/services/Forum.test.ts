import { ForumService } from './Forum';

async function testForumService() {
  const service = new ForumService();
  
  console.log('Testing Forum Service');
  console.log('='.repeat(50));
  
  // Test cases with different CI numbers
  const testCases = [
    { ci: '47073450', description: 'CI with no points available' },
    { ci: '12345678', description: 'CI not registered' },
    { ci: '99999999', description: 'Another test CI' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n${testCase.description}: ${testCase.ci}`);
    console.log('-'.repeat(40));
    
    try {
      // Test full checkMember response
      const memberResult = await service.checkMember({ ci: testCase.ci });
      console.log('Full Response:', JSON.stringify(memberResult, null, 2));
      
      // Test convenience methods
      const hasUser = await service.hasUser({ ci: testCase.ci });
      console.log('Has User:', hasUser);
      
      const points = await service.getPoints({ ci: testCase.ci });
      console.log('Points:', points);
      
      const member = await service.getMember({ ci: testCase.ci });
      console.log('Member:', member);
      
    } catch (error) {
      console.error('Error testing CI:', testCase.ci, error);
    }
  }
}

testForumService();
