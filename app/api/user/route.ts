/**
 * user profile API
 * retrieves user data including profile information and related content
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { User } from "@/models/User"
import { ForumTopic } from "@/models/ForumTopic"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

const querySchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    await limiter.check(10, "USER_GET") // 10 requests per minute
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const { email, username } = querySchema.parse(Object.fromEntries(searchParams))

  if (!email && !username) {
    return NextResponse.json({ error: "Email or username is required" }, { status: 400 })
  }

  let connection
  try {
    connection = await connectToDatabase()

    const query = email ? { email } : { username }
    const user = await User.findOne(query)
      .select("-password -__v")
      .populate("followers", "username displayName")
      .populate("following", "username displayName")
      .populate("favoriteSpots")
      .lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const popularTopics = await ForumTopic.find({ author: user._id })
      .sort({ replies: -1 })
      .limit(5)
      .select("title tags replies createdAt")
      .lean()

    const userData = {
      ...user,
      popularTopics,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

