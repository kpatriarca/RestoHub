const { MongoClient } = require('mongodb');

let client;
let database;
let connectionPromise;

async function connectDatabase() {
  // Reuse the database if this server instance is already connected.
  if (database) {
    return database;
  }

  // Reuse an in-progress connection instead of opening another one.
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'dbRestaurants';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  connectionPromise = (async () => {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      await client.connect();

      database = client.db(dbName);

      // Verify that MongoDB is actually reachable.
      await database.command({ ping: 1 });

      // Create required indexes.
      await database.collection('restaurants').createIndexes([
        { key: { name: 1 } },
        { key: { borough: 1 } },
        { key: { cuisine: 1 } },
        { key: { restaurant_id: 1 }, unique: true },
        { key: { 'grades.grade': 1 } },
      ]);

      console.log('MongoDB connected successfully.');

      return database;
    } catch (error) {
      // Allow a later request to retry the connection.
      connectionPromise = null;
      database = null;

      console.error('MongoDB connection failed:', error.message);

      throw Object.assign(
        new Error('Database connection is unavailable.'),
        { status: 503 }
      );
    }
  })();

  return connectionPromise;
}

async function getDatabase() {
  if (database) {
    return database;
  }

  return connectDatabase();
}

async function closeDatabase() {
  if (client) {
    await client.close();
  }

  client = null;
  database = null;
  connectionPromise = null;
}

module.exports = {
  connectDatabase,
  getDatabase,
  closeDatabase,
};