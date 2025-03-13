/**
 * content moderation API
 * lists and manages flagged or reported content
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic, ForumReply } from "@/models"
import { authOptions } from "../../auth/[...nextauth]/route"
import { z } from "zod"

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  type: z.enum(["all", "topics", "replies"]).default("all"),
  status: z.enum(["all", "flagged", "reported"]).default("all"),
  search: z.string().optional(),
})

// List of words that might indicate inappropriate content
const flaggedWords = [
  "inappropriate",
  "offensive",
  "spam",
  "scam",
  "abuse",
  "hate",
  "violent",
  "explicit",
  // Add more words as needed
]

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const { page, limit, type, status, search } = querySchema.parse(Object.fromEntries(searchParams))

  try {
    await connectToDatabase()

    const skip = (page - 1) * limit

    // Build the query based on filters
    let topicsQuery: any = {}
    let repliesQuery: any = {}

    if (status === "flagged") {
      // For flagged content, we search for potentially problematic words
      const wordRegex = flaggedWords.map((word) => new RegExp(word, "i"))
      const contentFilter = { $regex: new RegExp(flaggedWords.join("|"), "i") }

      topicsQuery = {
        $or: [{ title: contentFilter }, { content: contentFilter }],
      }

      repliesQuery = { content: contentFilter }
    }

    if (status === "reported") {
      // For reported content, we look for items that have been reported by users
      topicsQuery = { reportCount: { $gt: 0 } }
      repliesQuery = { reportCount: { $gt: 0 } }
    }

    if (search) {
      // Add search filter
      const searchFilter = { $regex: search, $options: "i" }

      topicsQuery = {
        ...topicsQuery,
        $or: [{ title: searchFilter }, { content: searchFilter }],
      }

      repliesQuery = {
        ...repliesQuery,
        content: searchFilter,
      }
    }

    // Fetch data based on content type
    let topics: any[] = []
    let replies: any[] = []
    let totalTopics = 0
    let totalReplies = 0

    if (type === "all" || type === "topics") {
      ;[topics, totalTopics] = await Promise.all([
        ForumTopic.find(topicsQuery)
          .sort({ createdAt: -1 })
          .skip(type === "all" ? skip : 0)
          .limit(type === "all" ? limit : limit / 2)
          .populate("author", "username displayName")
          .lean(),
        ForumTopic.countDocuments(topicsQuery),
      ])
    }

    if (type === "all" || type === "replies") {
      ;[replies, totalReplies] = await Promise.all([
        ForumReply.find(repliesQuery)
          .sort({ createdAt: -1 })
          .skip(type === "all" ? 0 : skip)
          .limit(type === "all" ? limit / 2 : limit)
          .populate("author", "username displayName")
          .populate("topic", "title")
          .lean(),
        ForumReply.countDocuments(repliesQuery),
      ])
    }

    // Calculate total items and pages
    const totalItems = totalTopics + totalReplies
    const totalPages = Math.ceil(totalItems / limit)

    return NextResponse.json({
      topics,
      replies,
      currentPage: page,
      totalPages,
      totalTopics,
      totalReplies,
      totalItems,
    })
  } catch (error) {
    console.error("Error fetching moderation content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, type, action } = body

    if (!id || !type || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const Model = type === "topic" ? ForumTopic : ForumReply

    if (action === "delete") {
      // Delete the content
      if (type === "topic") {
        // If deleting a topic, also delete all its replies
        const topic = await ForumTopic.findById(id)
        if (topic && topic.replies && topic.replies.length > 0) {
          await ForumReply.deleteMany({ _id: { $in: topic.replies } })
        }
      } else if (type === "reply") {
        // If deleting a reply, remove it from the topic's replies array
        const reply = await ForumReply.findById(id)
        if (reply) {
          await ForumTopic.findByIdAndUpdate(reply.topic, { $pull: { replies: id } })
        }
      }

      await Model.findByIdAndDelete(id)
      return NextResponse.json({ message: `${type} deleted successfully` })
    }

    if (action === "approve") {
      // Mark content as reviewed and approved
      await Model.findByIdAndUpdate(id, {
        isReviewed: true,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      return NextResponse.json({ message: `${type} approved` })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in moderation action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

