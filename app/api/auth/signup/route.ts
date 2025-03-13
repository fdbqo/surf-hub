/**
 * user registration API
 * creates new user accounts with hashed passwords
 * - 03/13/2025
 */
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { User } from "@/models/User"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { z } from "zod"

const removeSpaces = (str: string) => str.replace(/\s+/g, "").toLowerCase()

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = signupSchema.parse(body)

    await connectToDatabase()

    const username = removeSpaces(name)
    let uniqueUsername = username
    let counter = 1

    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${username}${counter}`
      counter++
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    const hashedPassword = await hash(password, 10)

    const newUser = new User({
      username: uniqueUsername,
      displayName: name,
      email,
      password: hashedPassword,
    })

    await newUser.save()

    return NextResponse.json({ message: "User created successfully", username: uniqueUsername }, { status: 201 })
  } catch (error) {
    console.error("Error in signup process:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ message: "An error occurred during signup", error: error.message }, { status: 500 })
  } finally {
    await disconnectFromDatabase()
  }
}

