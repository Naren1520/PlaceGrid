// Test MongoDB Connection
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abc:12a@placegrid.c3ni9sa.mongodb.net/placegrid?retryWrites=true&w=majority&appName=PlaceGrid';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  }
}

testConnection();
