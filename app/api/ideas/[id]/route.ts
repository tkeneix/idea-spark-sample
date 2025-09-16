import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 })
    }

    const data = await Database.getDetailedIdeaById(id)

    if (!data) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }

    return NextResponse.json({ idea: data })
  } catch (error) {
    console.error("Error fetching idea:", error)
    return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 })
  }
}
