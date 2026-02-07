/**
 * MongoDB Connection Test Utility
 * Simple test to verify MongoDB connectivity for Compass setup
 * 
 * Usage: node test-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusflow';

async function testConnection() {
  console.log('\n🔍 MongoDB Connection Test\n');
  console.log('═'.repeat(50));
  console.log(`Connection URI: ${MONGO_URI}`);
  console.log('═'.repeat(50));

  try {
    // Connect to MongoDB
    console.log('\n⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    // Get connection details
    const db = mongoose.connection;
    
    console.log('📊 Database Information:');
    console.log('─'.repeat(50));
    console.log(`Database Name: ${db.name}`);
    console.log(`Host: ${db.host}`);
    console.log(`Port: ${db.port}`);
    console.log('');

    console.log('✅ Your MongoDB is ready!\n');

    console.log('═'.repeat(50));
    console.log('\n🧭 MongoDB Compass Connection:\n');
    console.log('URI: mongodb://localhost:27017');
    console.log('Host: localhost');
    console.log('Port: 27017');
    console.log('Database: focusflow\n');

    console.log('📝 Next Steps:');
    console.log('─'.repeat(50));
    console.log('1. Open MongoDB Compass');
    console.log('2. Click "New Connection"');
    console.log('3. Paste: mongodb://localhost:27017');
    console.log('4. Click "Connect"');
    console.log('5. Navigate to "focusflow" database\n');

    console.log('💡 Note: Collections appear after you use the app.');
    console.log('   Sign up a user to create the first collection.\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:\n');
    console.error('1. Check if MongoDB is running:');
    console.error('   Get-Process -Name mongod');
    console.error('\n2. Verify the connection URI in .env:');
    console.error(`   Currently: ${MONGO_URI}`);
    console.error('\n3. Restart MongoDB and try again\n');
    process.exit(1);
  }
}

// Run test
testConnection();

