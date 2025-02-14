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

let isConnected = false

export const connectToDatabase = async () => {
  if (isConnected) {
    return mongoose.connection
  }

  try {
    const db = await mongoose.connect(uri, options)
    isConnected = true
    console.log("Connected to MongoDB")
    return db.connection
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log("Disconnected from MongoDB")
  } catch (error) {
    console.error("Failed to disconnect from MongoDB:", error)
    throw error
  }
}

