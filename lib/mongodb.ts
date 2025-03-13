import mongoose from "mongoose"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
}

// Define the mongoose global type
declare global {
  var cachedMongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

// Initialize the cached connection
const globalMongoose = global.cachedMongoose || { conn: null, promise: null }
global.cachedMongoose = globalMongoose

export async function connectToDatabase() {
  if (globalMongoose.conn) {
    console.log("Using existing MongoDB connection")
    return globalMongoose.conn
  }

  if (!globalMongoose.promise) {
    console.log("Creating new MongoDB connection")
    globalMongoose.promise = mongoose.connect(uri, options)
  }

  try {
    globalMongoose.conn = await globalMongoose.promise
    console.log("MongoDB connected successfully")
    return globalMongoose.conn
  } catch (e) {
    console.error("MongoDB connection error:", e)
    globalMongoose.promise = null
    throw e
  }
}

export async function disconnectFromDatabase() {
  // In development, we'll keep the connection
  if (process.env.NODE_ENV === "development") return

  // In production, we'll only disconnect if we're not in a serverless function
  // This prevents issues with connection pooling in serverless environments
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    // Only disconnect if we're not in a serverless function
    // In Next.js API routes or server components, we want to reuse connections
    return
  }

  if (globalMongoose.conn) {
    await mongoose.disconnect()
    globalMongoose.conn = null
  }
}

