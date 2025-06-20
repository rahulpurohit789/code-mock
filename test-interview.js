const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testInterviewFlow() {
  console.log('🧪 Testing Code Mock Interview Flow...\n');

  try {
    // Reset the interview
    console.log('1. Resetting interview session...');
    const resetResponse = await fetch(`${BASE_URL}/api/reset`, { method: 'POST' });
    const resetData = await resetResponse.json();
    console.log('✅ Session reset successfully:', resetData.message, '\n');

    // Test the flow
    console.log('2. Testing interview flow...');
    const flowResponse = await fetch(`${BASE_URL}/api/test-flow`);
    const flowData = await flowResponse.json();
    console.log('✅ Flow test response:', JSON.stringify(flowData, null, 2), '\n');

    // Test first message (should trigger introduction)
    console.log('3. Testing first message...');
    const firstResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });
    const firstData = await firstResponse.json();
    console.log('✅ First response phase:', firstData.phase);
    console.log('✅ Progress:', firstData.progress);
    console.log('✅ Response preview:', firstData.response.substring(0, 100) + '...\n');

    // Test second message (should progress to second intro question)
    console.log('4. Testing second message...');
    const secondResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'I am a software developer with 3 years of experience in JavaScript and Python.' 
      })
    });
    const secondData = await secondResponse.json();
    console.log('✅ Second response phase:', secondData.phase);
    console.log('✅ Progress:', secondData.progress);
    console.log('✅ Response preview:', secondData.response.substring(0, 100) + '...\n');

    // Test third message (should move to core topics)
    console.log('5. Testing third message...');
    const thirdResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'I worked on an e-commerce platform using React and Node.js. It was challenging but rewarding.' 
      })
    });
    const thirdData = await thirdResponse.json();
    console.log('✅ Third response phase:', thirdData.phase);
    console.log('✅ Progress:', thirdData.progress);
    console.log('✅ Response preview:', thirdData.response.substring(0, 100) + '...\n');

    console.log('🎉 Interview flow test completed successfully!');
    console.log('📊 Final state:');
    console.log('- Phase:', thirdData.phase);
    console.log('- Progress:', thirdData.progress.progress + '%');
    console.log('- Core questions asked:', thirdData.progress.coreQuestionsAsked);
    console.log('- Used topics:', thirdData.progress.usedTopics);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInterviewFlow(); 