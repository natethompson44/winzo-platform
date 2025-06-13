const https = require('https');

const possibleUrls = [
  'https://winzo-platform-production.up.railway.app',
  'https://winzo-platform.up.railway.app',
  'https://winzo-backend-production.up.railway.app',
  'https://winzo-backend.up.railway.app'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(`${url}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${url} - Status: ${res.statusCode}`);
          try {
            const response = JSON.parse(data);
            console.log(`   Response:`, response);
          } catch (e) {
            console.log(`   Raw response:`, data);
          }
          resolve({ url, success: true, data });
        } else {
          console.log(`❌ ${url} - Status: ${res.statusCode}`);
          resolve({ url, success: false, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${url} - Error: ${error.message}`);
      resolve({ url, success: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve({ url, success: false, error: 'timeout' });
    });
  });
}

async function testAllUrls() {
  console.log('🔍 Testing Railway URLs...\n');
  
  const results = [];
  for (const url of possibleUrls) {
    const result = await testUrl(url);
    results.push(result);
    console.log(''); // Add spacing
  }

  const workingUrls = results.filter(r => r.success);
  
  console.log('\n📊 Summary:');
  if (workingUrls.length > 0) {
    console.log('✅ Working URLs:');
    workingUrls.forEach(r => console.log(`   - ${r.url}`));
  } else {
    console.log('❌ No working URLs found');
  }

  console.log('\n❌ Failed URLs:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`   - ${r.url}: ${r.error || `Status ${r.statusCode}`}`);
  });
}

testAllUrls(); 