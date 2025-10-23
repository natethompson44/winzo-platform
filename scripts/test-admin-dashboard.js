#!/usr/bin/env node

/**
 * Test script for WINZO Admin Dashboard functionality
 * This script tests all admin endpoints and functionality
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@winzo.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = null;

async function makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return { response, data };
}

async function loginAsAdmin() {
    console.log('🔐 Logging in as admin...');
    
    const { response, data } = await makeRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
    });
    
    if (data.success) {
        authToken = data.token;
        console.log('✅ Admin login successful');
        console.log(`👤 User: ${data.user.email}`);
        console.log(`👑 Admin: ${data.user.is_admin}`);
        return true;
    } else {
        console.error('❌ Admin login failed:', data.error);
        return false;
    }
}

async function testAdminUsers() {
    console.log('\n📊 Testing admin users endpoint...');
    
    const { response, data } = await makeRequest('/api/admin/users');
    
    if (response.ok && data.success) {
        console.log('✅ Users endpoint working');
        console.log(`👥 Total users: ${data.count}`);
        console.log(`📋 Sample user data:`, data.data[0] || 'No users found');
        return true;
    } else {
        console.error('❌ Users endpoint failed:', data.error || 'Unknown error');
        return false;
    }
}

async function testAdminBets() {
    console.log('\n🎯 Testing admin bets endpoint...');
    
    const { response, data } = await makeRequest('/api/admin/bets');
    
    if (response.ok && data.success) {
        console.log('✅ Bets endpoint working');
        console.log(`🎲 Total bets: ${data.count}`);
        console.log(`📋 Sample bet data:`, data.data[0] || 'No bets found');
        return true;
    } else {
        console.error('❌ Bets endpoint failed:', data.error || 'Unknown error');
        return false;
    }
}

async function testAdminHealth() {
    console.log('\n🏥 Testing admin health endpoint...');
    
    const { response, data } = await makeRequest('/api/admin/health');
    
    if (response.ok && data.success) {
        console.log('✅ Health endpoint working');
        console.log(`📊 Status: ${data.data.status}`);
        console.log(`⏱️  Uptime: ${data.data.uptime.formatted}`);
        console.log(`👥 Users: ${data.data.database.user_count}`);
        console.log(`💾 Memory: ${Math.round(data.data.system.memory_usage.heapUsed / 1024 / 1024)}MB`);
        return true;
    } else {
        console.error('❌ Health endpoint failed:', data.error || 'Unknown error');
        return false;
    }
}

async function testRefreshOdds() {
    console.log('\n🔄 Testing refresh odds endpoint...');
    
    const { response, data } = await makeRequest('/api/admin/refresh-odds', {
        method: 'POST'
    });
    
    if (response.ok && data.success) {
        console.log('✅ Refresh odds endpoint working');
        console.log(`📝 Message: ${data.message}`);
        console.log(`⏰ Timestamp: ${data.timestamp}`);
        return true;
    } else {
        console.error('❌ Refresh odds endpoint failed:', data.error || 'Unknown error');
        return false;
    }
}

async function testNonAdminAccess() {
    console.log('\n🚫 Testing non-admin access (should fail)...');
    
    // Create a temporary non-admin token by logging in as a regular user
    // For this test, we'll use a fake token to simulate non-admin access
    const fakeToken = 'fake-token';
    const originalToken = authToken;
    authToken = fakeToken;
    
    const { response, data } = await makeRequest('/api/admin/users');
    
    if (response.status === 401 || response.status === 403) {
        console.log('✅ Non-admin access properly blocked');
        console.log(`📝 Response: ${data.error}`);
    } else {
        console.error('❌ Non-admin access was not blocked properly');
    }
    
    // Restore original token
    authToken = originalToken;
}

async function runAllTests() {
    console.log('🧪 Starting WINZO Admin Dashboard Tests\n');
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);
    console.log(`👤 Admin Email: ${ADMIN_EMAIL}\n`);
    
    const tests = [
        { name: 'Admin Login', fn: loginAsAdmin },
        { name: 'Admin Users Endpoint', fn: testAdminUsers },
        { name: 'Admin Bets Endpoint', fn: testAdminBets },
        { name: 'Admin Health Endpoint', fn: testAdminHealth },
        { name: 'Refresh Odds Endpoint', fn: testRefreshOdds },
        { name: 'Non-Admin Access Test', fn: testNonAdminAccess }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name} failed with error:`, error.message);
            failed++;
        }
    }
    
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Admin dashboard is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});
