#!/usr/bin/env node

/**
 * Simple test script to verify the application is working correctly
 */

import axios from 'axios';
import { WebSocket } from 'ws';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

console.log('🧪 Testing Freqtrade Full Stack Application...\n');

async function testAPI() {
  console.log('📡 Testing API endpoints...');
  
  const tests = [
    {
      name: 'Dashboard Metrics',
      endpoint: '/api/dashboard/metrics',
      method: 'GET'
    },
    {
      name: 'Recent Trades',
      endpoint: '/api/dashboard/recent-trades',
      method: 'GET'
    },
    {
      name: 'Strategies List',
      endpoint: '/api/strategies',
      method: 'GET'
    },
    {
      name: 'Alerts List',
      endpoint: '/api/alerts',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.endpoint}`,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Server not running`);
      } else {
        console.log(`⚠️  ${test.name}: ${error.response?.status || error.code} ${error.response?.statusText || error.message}`);
      }
    }
  }
}

async function testFreqtradeAPI() {
  console.log('\n🤖 Testing Freqtrade API integration...');
  
  const freqtradeTests = [
    {
      name: 'Freqtrade Ping',
      endpoint: '/api/freqtrade/ping',
      method: 'GET'
    },
    {
      name: 'Freqtrade Status',
      endpoint: '/api/freqtrade/status',
      method: 'GET'
    },
    {
      name: 'Freqtrade Balance',
      endpoint: '/api/freqtrade/balance',
      method: 'GET'
    }
  ];

  for (const test of freqtradeTests) {
    try {
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.endpoint}`,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Server not running`);
      } else {
        console.log(`⚠️  ${test.name}: ${error.response?.status || error.code} ${error.response?.statusText || error.message}`);
      }
    }
  }
}

async function testWebSocket() {
  console.log('\n🔌 Testing WebSocket connection...');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(WS_URL);
      
      const timeout = setTimeout(() => {
        console.log('❌ WebSocket: Connection timeout');
        ws.close();
        resolve();
      }, 5000);
      
      ws.on('open', () => {
        console.log('✅ WebSocket: Connected successfully');
        clearTimeout(timeout);
        ws.close();
        resolve();
      });
      
      ws.on('error', (error) => {
        console.log(`❌ WebSocket: ${error.message}`);
        clearTimeout(timeout);
        resolve();
      });
      
    } catch (error) {
      console.log(`❌ WebSocket: ${error.message}`);
      resolve();
    }
  });
}

async function testCreateStrategy() {
  console.log('\n📝 Testing strategy creation...');
  
  try {
    const strategyData = {
      name: 'Test Strategy',
      description: 'A test strategy created by the test script',
      code: 'def populate_indicators(self, dataframe, metadata): return dataframe',
      config: { timeframe: '1h' },
      isActive: false
    };
    
    const response = await axios.post(`${BASE_URL}/api/strategies`, strategyData, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`✅ Strategy Creation: ${response.status} ${response.statusText}`);
    
    // Clean up - delete the test strategy
    if (response.data && response.data.id) {
      try {
        await axios.delete(`${BASE_URL}/api/strategies/${response.data.id}`);
        console.log('🧹 Test strategy cleaned up');
      } catch (cleanupError) {
        console.log('⚠️  Could not clean up test strategy');
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Strategy Creation: Server not running');
    } else {
      console.log(`⚠️  Strategy Creation: ${error.response?.status || error.code} ${error.response?.statusText || error.message}`);
    }
  }
}

async function runTests() {
  await testAPI();
  await testFreqtradeAPI();
  await testWebSocket();
  await testCreateStrategy();
  
  console.log('\n🎉 Test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure your PostgreSQL database is running and configured');
  console.log('2. Set up your Freqtrade bot with API enabled');
  console.log('3. Add your OpenAI API key to the .env file');
  console.log('4. Run "npm run dev" to start the application');
  console.log('5. Visit http://localhost:5000 to access the dashboard');
}

runTests().catch(console.error);