const fs = require('fs');
const path = require('path');

console.log('=== Build Debug Information ===');

// Check if key files exist
const keyFiles = [
  'package.json',
  'src/index.tsx',
  'src/App.tsx',
  'public/index.html',
  'src/assets/winzo-logo.png'
];

console.log('\nChecking key files:');
keyFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check node_modules
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`\nNode modules: ${nodeModulesExists ? '✅' : '❌'}`);

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\nPackage.json dependencies:', Object.keys(packageJson.dependencies || {}).length);
  console.log('Package.json devDependencies:', Object.keys(packageJson.devDependencies || {}).length);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check environment
console.log('\nEnvironment:');
console.log('Node version:', process.version);
console.log('NPM version:', process.env.npm_config_user_agent);
console.log('Current directory:', process.cwd());

console.log('\n=== End Debug Information ==='); 