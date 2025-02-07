import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm" // Import eq from drizzle-orm

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)) // Use eq here
  if (existingUser.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 })
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create new user
  const newUser = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning()

  return NextResponse.json({ user: { id: newUser[0].id, name: newUser[0].name, email: newUser[0].email } })
}