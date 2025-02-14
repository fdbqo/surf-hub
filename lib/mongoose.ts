import mongoose from "mongoose"

const dbName = "SurfHub"

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in the environment variables")
    }
    await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

export default connectDB

