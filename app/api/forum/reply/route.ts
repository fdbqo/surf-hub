import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic, ForumReply, User } from "@/models"
import mongoose from "mongoose"

export async function POST(request: Request) {
  const session = await getServerSession()

  console.log("Session:", JSON.stringify(session, null, 2))

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id

  if (!userId) {
    console.log("User ID not found in session, attempting to fetch from database")
    try {
      await connectToDatabase()
      const user = await User.findOne({ email: session.user.email })
      if (user) {
        userId = user._id.toString()
        console.log("User ID fetched from database:", userId)
      } else {
        console.log("User not found in database")
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    } catch (error) {
      console.error("Error fetching user from database:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  try {
    const { topicId, content } = await request.json()

    if (!topicId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const topic = await ForumTopic.findById(topicId)
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    console.log("Creating new reply with author:", userId)

    const newReply = new ForumReply({
      content,
      author: new mongoose.Types.ObjectId(userId),
      topic: new mongoose.Types.ObjectId(topicId),
    })

    console.log("New reply before save:", JSON.stringify(newReply, null, 2))

    await newReply.save()

    console.log("New reply after save:", JSON.stringify(newReply, null, 2))

    // Update the topic's replies array
    await ForumTopic.findByIdAndUpdate(topicId, { $push: { replies: newReply._id } })

    // Populate the author information
    await newReply.populate("author", "username displayName")

    return NextResponse.json(newReply, { status: 201 })
  } catch (error) {
    console.error("Error creating forum reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

