import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumReply, ForumTopic } from "@/models"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id

  try {
    await connectToDatabase()

    const reply = await ForumReply.findById(id)

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 })
    }

    if (reply.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Remove the reply from the topic's replies array
    await ForumTopic.findByIdAndUpdate(reply.topic, { $pull: { replies: id } })

    // Delete the reply
    await ForumReply.findByIdAndDelete(id)

    return NextResponse.json({ message: "Reply deleted successfully" })
  } catch (error) {
    console.error("Error deleting forum reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

