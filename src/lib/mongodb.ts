import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

function getMongoUri() {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  return MONGODB_URI;
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = getMongoUri();

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: 'handcrafted_haven',
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectToDatabase;
