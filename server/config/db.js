const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the provided URI.
 * If the connection fails, the promise will reject with the underlying error.
 *
 * @param {string} uri MongoDB connection string
 * @returns {Promise<void>}
 */
async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;