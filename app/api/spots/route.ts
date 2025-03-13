/**
 * public surf spots API
 * retrieves surf spot listings with filtering options
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { SurfSpot } from "@/models/SurfSpot"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  search: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    await limiter.check(5, "SPOTS_GET")
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const { page, limit, search } = querySchema.parse(Object.fromEntries(searchParams))

  try {
    await connectToDatabase()

    const skip = (page - 1) * limit

    const query = search ? { name: { $regex: search, $options: "i" } } : {}

    console.log("API Query:", JSON.stringify(query))

    const [spots, total] = await Promise.all([
      SurfSpot.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      SurfSpot.countDocuments(query),
    ])

    console.log(`API found ${spots.length} spots`)

    return NextResponse.json({
      spots,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSpots: total,
    })
  } catch (error) {
    console.error("Error fetching surf spots:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

