// Test script for Portfolio Chatbot API
// Usage: node test-api.js [staging|production]

const environment = process.argv[2] || 'staging';
const baseUrl = `https://portfolio-chatbot-${environment}.picographer0214.workers.dev`;

console.log(`🧪 Testing Portfolio Chatbot API (${environment})`);
console.log(`📍 Base URL: ${baseUrl}\n`);

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...\n`);
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}\n`);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('1. Testing Health Check...');
  await testEndpoint('/health');
  
  console.log('2. Testing Portfolio Information...');
  await testEndpoint('/api/portfolio');
  
  console.log('3. Testing Chat Endpoint (Basic)...');
  await testEndpoint('/api/chat', 'POST', {
    message: 'Hello! Tell me about yourself.',
    useGemini: false
  });
  
  console.log('4. Testing Chat Endpoint (Gemini)...');
  await testEndpoint('/api/chat', 'POST', {
    message: 'What are your main projects?',
    useGemini: true
  });
  
  console.log('5. Testing Search Endpoint...');
  await testEndpoint('/api/search', 'POST', {
    query: 'machine learning',
    n_results: 3
  });
  
  console.log('6. Testing Unknown Endpoint...');
  await testEndpoint('/unknown');
  
  console.log('🎉 Test suite completed!');
  console.log('\n📝 Notes:');
  console.log('- If Gemini tests fail, make sure GEMINI_API_KEY is set as a secret');
  console.log('- Check the deployment logs with: wrangler tail --env ' + environment);
  console.log('- For more info, see deploy.md');
}

// Run tests
runTests().catch(console.error);
