/**
 * forum topic detail API
 * retrieves, updates, and deletes specific forum topics
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic, ForumReply } from "@/models"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    await connectToDatabase()

    const topic = await ForumTopic.findById(id)
      .populate({
        path: "author",
        select: "username displayName",
      })
      .populate({
        path: "linkedSpot",
        select: "name difficulty waveType bestSeason imageUrl averageWaveHeight windDirection",
      })
      .lean()

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    const replies = await ForumReply.find({ topic: id })
      .populate({
        path: "author",
        select: "username displayName",
      })
      .sort({ createdAt: 1 })
      .lean()

    // Filter out any replies with null authors after populating
    const validReplies = replies.filter((reply) => reply.author != null)

    return NextResponse.json({ topic, replies: validReplies })
  } catch (error) {
    console.error("Error fetching forum topic:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  try {
    await connectToDatabase()

    const topic = await ForumTopic.findById(id)

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    if (topic.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete all replies associated with this topic
    await ForumReply.deleteMany({ topic: id })

    // Delete the topic
    await ForumTopic.findByIdAndDelete(id)

    return NextResponse.json({ message: "Topic and associated replies deleted successfully" })
  } catch (error) {
    console.error("Error deleting forum topic:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

