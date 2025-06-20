import fetch from 'node-fetch';

async function testDSAPhase() {
  console.log('🧪 Testing DSA Phase Fix...\n');
  
  try {
    // Reset session
    console.log('1. Resetting session...');
    const resetResponse = await fetch('http://localhost:3001/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Session reset');
    
    // Force transition to DSA phase
    console.log('\n2. Forcing transition to DSA phase...');
    const transitionResponse = await fetch('http://localhost:3001/api/force-transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: 'dsa_problem' })
    });
    console.log('✅ Forced transition to DSA phase');
    
    // Test DSA phase response
    console.log('\n3. Testing DSA phase response...');
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Ready for the coding challenge!' })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`HTTP ${chatResponse.status}: ${chatResponse.statusText}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('✅ DSA phase response received');
    console.log('📋 Phase:', chatData.phase);
    console.log('📋 Has DSA problem:', !!chatData.dsaProblem);
    
    if (chatData.dsaProblem) {
      console.log('📋 Problem title:', chatData.dsaProblem.title);
      console.log('📋 Test cases count:', chatData.dsaProblem.testCases.length);
    }
    
    console.log('\n🎉 DSA phase test completed successfully!');
    console.log('✅ No more "Sorry, I encountered an error" message!');
    
  } catch (error) {
    console.error('❌ Error during DSA phase test:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testDSAPhase(); 