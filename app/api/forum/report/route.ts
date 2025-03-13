/**
 * content reporting API
 * handles user reports of inappropriate forum content
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic, ForumReply } from "@/models"
import { z } from "zod"

const reportSchema = z.object({
  id: z.string(),
  type: z.enum(["topic", "reply"]),
  reason: z.string().min(1).max(500),
})

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, type, reason } = reportSchema.parse(body)

    await connectToDatabase()

    const Model = type === "topic" ? ForumTopic : ForumReply
    const content = await Model.findById(id)

    if (!content) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 })
    }

    // Check if user has already reported this content
    if (content.reportedBy && content.reportedBy.includes(session.user.id)) {
      return NextResponse.json({ error: "You have already reported this content" }, { status: 400 })
    }

    // Update the content with the report
    await Model.findByIdAndUpdate(id, {
      $inc: { reportCount: 1 },
      $push: {
        reportedBy: session.user.id,
        reports: {
          user: session.user.id,
          reason,
          createdAt: new Date(),
        },
      },
    })

    return NextResponse.json({ message: `${type} reported successfully` })
  } catch (error) {
    console.error("Error reporting content:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

