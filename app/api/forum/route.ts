/**
 * forum topics API
 * handles listing and creating forum topics
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic } from "@/models/ForumTopic"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import mongoose from "mongoose"

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  search: z.string().optional(),
  spot: z.string().optional(), // Add spot filter
})

const createTopicSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(5000),
  tags: z.array(z.string()).min(1).max(5),
  linkedSpot: z.string().optional(), // Add optional linked spot
})

export async function GET(request: Request) {
  try {
    await limiter.check(5, "FORUM_GET")
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const { page, limit, search, spot } = querySchema.parse(Object.fromEntries(searchParams))

  try {
    await connectToDatabase()

    const skip = (page - 1) * limit
    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { tags: { $in: [new RegExp(search, "i")] } }]
    }

    // Add spot filter if provided
    if (spot) {
      query.linkedSpot = new mongoose.Types.ObjectId(spot)
    }

    const [topics, total] = await Promise.all([
      ForumTopic.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username displayName")
        .populate("linkedSpot", "name difficulty waveType bestSeason imageUrl") // Populate linked spot
        .lean(),
      ForumTopic.countDocuments(query),
    ])

    return NextResponse.json({
      topics,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTopics: total,
    })
  } catch (error) {
    console.error("Error fetching forum topics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

export async function POST(request: Request) {
  try {
    await limiter.check(2, "FORUM_POST")
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, tags, linkedSpot } = createTopicSchema.parse(body)

    await connectToDatabase()

    const newTopic = new ForumTopic({
      title,
      content,
      author: session.user.id,
      tags,
      linkedSpot: linkedSpot ? new mongoose.Types.ObjectId(linkedSpot) : undefined,
    })

    await newTopic.save()

    return NextResponse.json({ message: "Topic created successfully", topic: newTopic }, { status: 201 })
  } catch (error) {
    console.error("Error creating forum topic:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

