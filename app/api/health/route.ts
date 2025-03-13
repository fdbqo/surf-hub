/**
 * health check API
 * verifies system connectivity and database status
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    const connection = await connectToDatabase()

    return NextResponse.json({
      status: "ok",
      mongodb: "connected",
      mongodbVersion: mongoose.version,
      nodeVersion: process.version,
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await disconnectFromDatabase()
  }
}

