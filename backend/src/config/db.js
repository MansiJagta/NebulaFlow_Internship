let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[nebula-flow] MONGODB_URI not set – skipping database connection.');
    return;
  }

  // Lazy-load mongoose so the server can still start
  // even if the dependency is not installed in dev.
  let mongoose;
  try {
    // eslint-disable-next-line global-require
    mongoose = require('mongoose');
  } catch (err) {
    console.warn('[nebula-flow] mongoose not installed – skipping database connection.');
    return;
  }

  if (isConnected) return;

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    isConnected = true;
    console.log('[nebula-flow] Connected to MongoDB');
  } catch (err) {
    // Keep the console clean; log a short, single-line message only.
    console.log('[nebula-flow] MongoDB connection failed');
  }
}

module.exports = {
  connectDB,
};

