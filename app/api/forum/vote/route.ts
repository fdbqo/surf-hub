/**
 * forum voting API
 * manages upvotes and downvotes on forum content
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { ForumTopic, ForumReply } from "@/models"
import mongoose from "mongoose"

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, type, action } = await request.json()
    console.log(`Received vote request: id=${id}, type=${type}, action=${action}`)

    if (!id || !type || action === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const userId = session.user.id // Use the user ID directly from the session
    console.log(`User ID from session: ${userId}`)

    const itemId = new mongoose.Types.ObjectId(id)

    const Model = type === "topic" ? ForumTopic : ForumReply
    const item = await Model.findById(itemId)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    console.log("Before update:", {
      upvotes: item.upvotes,
      downvotes: item.downvotes,
    })

    // Remove user's vote from both arrays
    item.upvotes = item.upvotes.filter((vote) => vote.user.toString() !== userId)
    item.downvotes = item.downvotes.filter((vote) => vote.user.toString() !== userId)

    // Add the new vote if it's not null (i.e., not canceling)
    if (action === "upvote") {
      item.upvotes.push({ user: userId })
    } else if (action === "downvote") {
      item.downvotes.push({ user: userId })
    }
    // If action is null, we don't add any vote (effectively removing the vote)

    await item.save()

    console.log("After update:", {
      upvotes: item.upvotes,
      downvotes: item.downvotes,
    })

    const userVote = item.upvotes.some((vote) => vote.user.toString() === userId)
      ? "upvote"
      : item.downvotes.some((vote) => vote.user.toString() === userId)
        ? "downvote"
        : null

    return NextResponse.json({
      upvotes: item.upvotes,
      downvotes: item.downvotes,
      userVote,
    })
  } catch (error) {
    console.error("Error handling vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

