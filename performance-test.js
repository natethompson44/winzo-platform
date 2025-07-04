const puppeteer = require('puppeteer');

/**
 * Performance Test Script
 * Measures image loading performance and HTTP request patterns
 */

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Track network requests
  const requests = [];
  const imageRequests = [];
  
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      resourceType: request.resourceType(),
      timestamp: Date.now()
    });
    
    if (request.resourceType() === 'image') {
      imageRequests.push({
        url: request.url(),
        timestamp: Date.now()
      });
      console.log(`📷 Image request: ${request.url()}`);
    }
    
    request.continue();
  });
  
  // Monitor console logs
  page.on('console', (msg) => {
    if (msg.text().includes('cache') || msg.text().includes('logo') || msg.text().includes('♻️') || msg.text().includes('🎯')) {
      console.log(`📋 Console: ${msg.text()}`);
    }
  });
  
  console.log('🌐 Navigating to localhost:3000...');
  
  try {
    // Navigate to the soccer page
    await page.goto('http://localhost:3000/soccer', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for components to load
    await page.waitForSelector('.top_matches__content', { timeout: 10000 });
    
    // Wait additional time for all components to render
    await page.waitForTimeout(5000);
    
    // Analyze requests
    console.log('\n📊 Performance Analysis:');
    console.log(`Total HTTP requests: ${requests.length}`);
    console.log(`Image requests: ${imageRequests.length}`);
    
    // Group image requests by URL
    const imageRequestCounts = {};
    imageRequests.forEach(req => {
      const url = req.url;
      imageRequestCounts[url] = (imageRequestCounts[url] || 0) + 1;
    });
    
    // Find excessive requests
    const excessiveRequests = Object.entries(imageRequestCounts)
      .filter(([url, count]) => count > 3)
      .sort((a, b) => b[1] - a[1]);
    
    if (excessiveRequests.length > 0) {
      console.log('\n❌ Excessive Image Requests Detected:');
      excessiveRequests.forEach(([url, count]) => {
        console.log(`  🔄 ${count}x - ${url}`);
      });
    } else {
      console.log('\n✅ No excessive image requests detected!');
    }
    
    // Check for specific problematic images
    const problematicImages = [
      'default-team.png',
      'epl-icon.png',
      'soccer-icon.png'
    ];
    
    console.log('\n🔍 Specific Image Analysis:');
    problematicImages.forEach(imageName => {
      const count = Object.entries(imageRequestCounts)
        .filter(([url]) => url.includes(imageName))
        .reduce((sum, [url, count]) => sum + count, 0);
      
      if (count > 0) {
        console.log(`  📷 ${imageName}: ${count} requests ${count > 3 ? '❌' : '✅'}`);
      }
    });
    
    // Test cache statistics if available
    const cacheStats = await page.evaluate(() => {
      try {
        // Check if imageCache is available
        if (window.imageCache) {
          return window.imageCache.getCacheStats();
        }
        return null;
      } catch (e) {
        return null;
      }
    });
    
    if (cacheStats) {
      console.log('\n💾 Image Cache Statistics:');
      console.log(`  Cache entries: ${cacheStats.total}`);
      console.log(`  Successfully loaded: ${cacheStats.loaded}`);
      console.log(`  Failed loads: ${cacheStats.failed}`);
      console.log(`  Hit rate: ${cacheStats.hitRate}%`);
      console.log(`  Preloaded images: ${cacheStats.preloaded}`);
    }
    
    // Performance score
    let score = 100;
    if (imageRequests.length > 50) score -= 30;
    if (excessiveRequests.length > 0) score -= 40;
    if (imageRequests.length > 100) score -= 30;
    
    console.log(`\n🎯 Performance Score: ${Math.max(0, score)}/100`);
    
    if (score >= 80) {
      console.log('🎉 Excellent performance!');
    } else if (score >= 60) {
      console.log('⚠️ Good performance, some optimization opportunities');
    } else {
      console.log('❌ Poor performance, optimization needed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if Next.js dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkDevServer();
  
  if (!serverRunning) {
    console.log('❌ Next.js dev server not running on localhost:3000');
    console.log('Please start the server with: cd oddsx/oddsx-react && npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Next.js dev server detected');
  await runPerformanceTest();
}

main().catch(console.error); 