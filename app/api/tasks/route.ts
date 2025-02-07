import { NextResponse } from "next/server"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(auth)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const allTasks = await db.select().from(tasks).where(eq(tasks.userId, userId))
  return NextResponse.json(allTasks)
}

export async function POST(req: Request) {
  const session = await getServerSession(auth)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, projectId, priority, dueDate } = await req.json()
  const userId = Number(session.user.id)

  const newTask = await db
    .insert(tasks)
    .values({
      title,
      description,
      userId,
      projectId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning()

  return NextResponse.json(newTask[0])
}

