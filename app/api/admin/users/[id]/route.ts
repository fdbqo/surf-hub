/**
 * admin user detail API
 * retrieves and updates specific user accounts
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { User } from "@/models/User"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { z } from "zod"

const updateRoleSchema = z.object({
  role: z.enum(["user", "moderator", "admin"]),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const user = await User.findById(params.id, "username displayName email role").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)

    await connectToDatabase()
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true, select: "username displayName email role" },
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

