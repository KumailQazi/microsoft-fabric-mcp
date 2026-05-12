#!/usr/bin/env node
// mcp-bridge-final-fixed.js - With correct Accept headers

import fetch from 'node-fetch';
import { createInterface } from 'readline';

const MCP_SERVER_URL = 'http://localhost:3000/mcp';

console.error('🚀 MCP Final Bridge (Fixed Headers) started');
console.error(`📡 Target: ${MCP_SERVER_URL}`);
console.error('='.repeat(50));

const rl = createInterface({
  input: process.stdin,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;
  
  console.error(`\n📨 Received from Claude: ${line}`);
  
  try {
    const request = JSON.parse(line);
    console.error(`📦 Request method: ${request.method || 'unknown'}, id: ${request.id}`);
    
    // Forward to HTTP server with CORRECT headers
    console.error(`⏳ POST to ${MCP_SERVER_URL}...`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'  // CRITICAL: Both types!
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      console.error(`📊 HTTP Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.error(`📄 Raw response (${responseText.length} chars):`, responseText);
      
      if (!responseText.trim()) {
        console.error('❌ Empty response from server');
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Empty response from server' },
          id: request.id
        }) + '\n');
        return;
      }
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.error('✅ Response parsed as JSON');
      } catch (e) {
        console.error('❌ Response is not JSON:', e.message);
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Invalid JSON response', data: responseText },
          id: request.id
        }) + '\n');
        return;
      }
      
      // Format as proper JSON-RPC response
      const formattedResponse = {
        jsonrpc: '2.0',
        id: request.id
      };
      
      if (responseData.error) {
        formattedResponse.error = responseData.error;
      } else {
        formattedResponse.result = responseData;
      }
      
      const output = JSON.stringify(formattedResponse);
      console.error(`📤 Sending to Claude: ${output}`);
      process.stdout.write(output + '\n');
      
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('❌ Fetch error:', fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Request timeout after 10 seconds');
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Request timeout' },
          id: request.id
        }) + '\n');
      } else {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: fetchError.message },
          id: request.id
        }) + '\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: error.message },
      id: null
    }) + '\n');
  }
  
  console.error('-'.repeat(50));
});

rl.on('close', () => {
  console.error('👋 Bridge shutting down');
  process.exit(0);
});

console.error('✨ Bridge ready with correct Accept headers!');
console.error('✨ Waiting for messages from Claude...');