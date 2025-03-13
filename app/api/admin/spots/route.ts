/**
 * admin surf spots API
 * lists and creates surf spot locations
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { SurfSpot } from "@/models/SurfSpot"
import { authOptions } from "../../auth/[...nextauth]/route"
import { z } from "zod"

// Schema for validating spot data
const spotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z
        .number()
        .min(-90)
        .max(90), // latitude
      z
        .number()
        .min(-180)
        .max(180), // longitude
    ]),
  }),
  difficulty: z.number().min(1).max(5),
  waveType: z.string().min(1, "Wave type is required"),
  bestSeason: z.string().min(1, "Best season is required"),
  imageUrl: z.string().optional(),
  averageWaveHeight: z.number().optional(),
  windDirection: z.string().optional(),
  waterTemperature: z.number().optional(),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const spots = await SurfSpot.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(spots)
  } catch (error) {
    console.error("Error fetching surf spots:", error)
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

    // Validate the request body
    const validatedData = spotSchema.parse(body)

    await connectToDatabase()

    const newSpot = new SurfSpot({
      ...validatedData,
      createdBy: session.user.id,
    })

    await newSpot.save()
    return NextResponse.json(newSpot, { status: 201 })
  } catch (error) {
    console.error("Error creating surf spot:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

