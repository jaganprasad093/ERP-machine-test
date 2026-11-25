const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');

let memoryServer = null;

const connectDB = async () => {
  try {
    // Attempt connecting to configured MONGO_URI with 3-second serverSelectionTimeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      driverInfo: { name: 'nodejs', version: '26.0.0' }
    });
    console.log(`[Database] Connected successfully to MongoDB at ${MONGO_URI}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${err.message}).`);
    
    // Fallback: If not in strict production or if primary failed, initialize MongoMemoryServer
    try {
      console.log('[Database] Initializing in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'erp_management' }
      });
      const uri = memoryServer.getUri();
      await mongoose.connect(uri, {
        driverInfo: { name: 'nodejs', version: '26.0.0' }
      });
      console.log(`[Database] Connected to Embedded MongoDB at ${uri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start MongoDB connection:', memErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (error) {
    console.error('[Database] Error disconnecting from MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
