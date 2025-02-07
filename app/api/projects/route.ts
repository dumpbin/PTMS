import { NextResponse } from "next/server"
import { db } from "@/db"
import { projects } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(auth)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const allProjects = await db.select().from(projects).where(eq(projects.userId, userId))
  return NextResponse.json(allProjects)
}

export async function POST(req: Request) {
  const session = await getServerSession(auth)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, description } = await req.json()
  const userId = Number(session.user.id)

  const newProject = await db
    .insert(projects)
    .values({
      name,
      description,
      userId,
    })
    .returning()

  return NextResponse.json(newProject[0])
}

export async function PUT(req: Request) {
  const session = await getServerSession(auth)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, ...updateData } = await req.json()
  const userId = Number(session.user.id)

  const updatedProject = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id) && eq(projects.userId, userId))
    .returning()

  if (updatedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(updatedProject[0])
}

export async function DELETE(req: Request) {
  const session = await getServerSession(auth)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()
  const userId = Number(session.user.id)

  const deletedProject = await db
    .delete(projects)
    .where(eq(projects.id, id) && eq(projects.userId, userId))
    .returning()

  if (deletedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ message: "Project deleted successfully" })
}

