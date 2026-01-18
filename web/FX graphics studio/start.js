#!/usr/bin/env node

/**
 * Quick Start Guide for FX Graphics Backend
 * 
 * This script will help you set up and test the backend system.
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== FX Graphics Backend Setup ===\n');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ Dependencies not installed!\n');
    console.log('Run this command:');
    console.log('  npm install\n');
    process.exit(1);
}

console.log('✅ Dependencies installed\n');

// Check if server.js exists
if (!fs.existsSync(path.join(__dirname, 'server.js'))) {
    console.log('❌ server.js not found!');
    process.exit(1);
}

console.log('✅ Server file found\n');

// Start the server
console.log('🚀 Starting backend server...\n');
console.log('Server will run on: http://localhost:5000');
console.log('Admin panel: http://localhost:5000/admin.html\n');
console.log('Default login:');
console.log('  Username: admin');
console.log('  Password: password123\n');
console.log('⚠️  CHANGE YOUR PASSWORD IMMEDIATELY!\n');
console.log('Press Ctrl+C to stop the server.\n');
console.log('-----------------------------------\n');

require('./server.js');
